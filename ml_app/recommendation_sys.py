import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
from io import StringIO
import ast
from flask import jsonify
import pandas as pd

class RecommendationGenerator():
    def __init__(self, interactions_csv, user_preferences_csv, content_csv):
        # Read interactions CSV data
        interactions_data = StringIO(interactions_csv)
        self.interactions_df = pd.read_csv(interactions_data)

        # Read user preferences CSV data
        user_preferences_data = StringIO(user_preferences_csv)
        self.users_df = pd.read_csv(user_preferences_data)
        # Preprocess subjects column
        self.users_df['subjects'] = self.users_df['subjects'].apply(ast.literal_eval)

        # Preprocess media_formats column
        self.users_df['media_formats'] = self.users_df['media_formats'].apply(ast.literal_eval)

        # Read content CSV data
        content_data = StringIO(content_csv)
        self.content_df = pd.read_csv(content_data)
        self.tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    
        self.content_df['title'] =  self.content_df['title'].str.lower()
        self.content_df['description'] =  self.content_df['description'].str.lower()
        self.content_df['subject_area'] =  self.content_df['subject_area'].str.lower()
        self.content_df['content_type'] =  self.content_df['content_type'].str.lower()
        self.content_df['visibility'] =  self.content_df['visibility'].str.lower()
        self.content_df['content_url'] =  self.content_df['content_url'].str.lower()

        # Convert text data in the users_df DataFrame to lowercase
        self.users_df['media_formats'] =  self.users_df['media_formats'].apply(lambda x: [item.lower() for item in x])
        self.users_df['subjects'] =  self.users_df['subjects'].apply(lambda x: [item.lower() for item in x])

        # Concatenate selected columns for each row
        content_text = self.content_df[['title', 'description', 'content_type', 'subject_area']].apply(lambda x: ' '.join(x.dropna()), axis=1)
        
        # Vectorize concatenated strings
        self.content_features = self.tfidf_vectorizer.fit_transform(content_text)

        row_text =  self.content_df.iloc[6]['title'] + ' ' + \
            self.content_df.iloc[6]['description'] + ' ' + \
            self.content_df.iloc[6]['subject_area'] + ' ' + \
            self.content_df.iloc[6]['content_type'] + ' ' + \
            self.content_df.iloc[6]['visibility'] + ' ' + \
            self.content_df.iloc[6]['content_url']

        # Vectorize the row text using the TfidfVectorizer
        vectorized_row =  self.tfidf_vectorizer.transform([row_text])

        # Get the feature names from the TfidfVectorizer
        feature_names =  self.tfidf_vectorizer.get_feature_names_out()

        # Print the feature names along with their corresponding TF-IDF values
        for feature_index, feature_name in zip(vectorized_row.indices, vectorized_row.data):
            print(f"Feature Name: {feature_names[feature_index]}, TF-IDF Value: {feature_name}")

    def _compute_similarity_scores(self, user_id):
        similarity_scores = {}
        user_profile = self._create_user_profile(user_id)

        for idx in range(len(self.content_df)):
            # Compute cosine similarity between user profile and content features
            similarity_scores[self.content_df.iloc[idx]['id']] = cosine_similarity(user_profile, self.content_features[idx])

        return similarity_scores
    def _get_recent_interactions(self, user_id, num_interactions=5):
        # Sort interactions by timestamp in descending order
        sorted_interactions = self.interactions_df.sort_values(by='timestamp', ascending=False)
        
        # Filter interactions for the specified user
        user_interactions = sorted_interactions[sorted_interactions['user_id']==user_id]
        
        # Filter out duplicate contents
        user_interactions = user_interactions.drop_duplicates(subset=['content_id'])
        
        # Select the first few interactions (most recent)
        recent_interactions = user_interactions.head(num_interactions)
    
        return recent_interactions['content_id'].tolist()
    
    def _create_user_profile(self, user_id):
        user_row = self.users_df[self.users_df['user_id'] == user_id].iloc[0]
        media_formats = user_row['media_formats']
        subjects = user_row['subjects']
        
        # Get the list of the top 5 unique content IDs that the user recently interacted with

        user_interacted_content_ids = self._get_recent_interactions(user_id, num_interactions=5)

        
        # Initialize an empty list to store content titles or descriptions
        user_interacted_content_texts = []
        
        # Loop through each content ID and fetch its title or description
        for content_id in user_interacted_content_ids:
            # Get the content information based on the content ID
            content_info = self.content_df[self.content_df['id'] == content_id][['title', 'description', 'content_type', 'subject_area']].iloc[0]
            # Concatenate the content information into a single string
            content_text = f"{content_info['title']} {content_info['description']} {content_info['content_type']} {content_info['subject_area']  }"
            user_interacted_content_texts.append(content_text)
        
        # Create a set of all unique interests (media_formats, subjects, and user-interacted content)
        all_interests = set(media_formats + subjects + [content_text for content_text in user_interacted_content_texts])
       
        # Create a binary feature vector representing user's interests
        user_profile = [1 if term in all_interests else 0 for term in self.tfidf_vectorizer.get_feature_names_out()]
        
        # Reshape the binary feature vector into a numpy array and normalize it
        user_profile = normalize(np.asarray(user_profile).reshape(1, -1))
       
        return user_profile

    def generate_recommendations(self, user_id, top_n=15):
        user_id = int(user_id)
        similarity_scores = self._compute_similarity_scores(user_id)

        user_interacted_content = self.interactions_df[self.interactions_df['user_id'] == user_id]['content_id'].tolist()
        user_posts = self.content_df[self.content_df['posted_by'] == user_id]['id'].tolist()
        
        # Remove content already interacted with or posted by the user
        similarity_scores = {content_id: score for content_id, score in similarity_scores.items() 
                     if content_id not in user_interacted_content 
                     and content_id not in user_posts}
       
        # Sort recommendations based on similarity score
        sorted_scores = sorted(similarity_scores.items(), key=lambda x: x[1], reverse=True)
        top_recommendations = [content_id for content_id, _ in sorted_scores[:top_n]]

        # Extract recommendations from content DataFrame
        recommendations = self.content_df[self.content_df['id'].isin(top_recommendations)].copy()

        # Initialize 'similarity_score' column with NaN
        recommendations['similarity_score'] = np.nan

        # Assign non-zero similarity scores to 'similarity_score' column
        for content_id, score in sorted_scores:
            if score[0][0] > 0:
                recommendations.loc[recommendations['id'] == content_id, 'similarity_score'] = score[0][0]

        # Sort recommendations according to similarity score
        recommendations = recommendations.sort_values(by='similarity_score', ascending=False)

        # Convert sorted recommendations to dictionary records
        recommendations = recommendations.to_dict("records")
        return recommendations
    def _generate_knowledge_based_recommendations(self, interests, top_n):
        filtered_content = self.content_df[self.content_df['subject_area'].isin(interests)]
        interaction_counts = self.interactions_df['content_id'].value_counts()
        sorted_content = filtered_content.assign(InteractionCount=interaction_counts).sort_values(by='InteractionCount', ascending=False)
        top_recommendations = sorted_content['id'][:top_n].tolist()
        recommendations = self.content_df[self.content_df['id'].isin(top_recommendations)].to_dict("records")
        return recommendations
