from typing import List
import nltk
from nltk.tokenize import sent_tokenize
import toolz
nltk.download('punkt')
from ml_app.data_cleaning_module.dupe_removal import remove_distractors_duplicate_with_correct_answer, remove_duplicates
from ml_app.data_cleaning_module.text_cleaning import clean_text
from ml_app.models.distractor_generator import DistractorGenerator
from ml_app.models.question_generator import QuestionGenerator
from ml_app.models.sense2vec_generation import Sense2VecDistractorGeneration
from .question import Question
import re
import time



class MCQGenerator():
    def __init__(self, is_verbose=False):
        self.is_verbose = is_verbose
        self.start_time = time.perf_counter()
        print('Loading ML Models...')

        self.question_generator = QuestionGenerator()
        print('Loaded QuestionGenerator in', round(time.perf_counter() - self.start_time, 2), 'seconds.') if self.is_verbose else ''

        

    def generate_mcq_questions(self, context: str, desired_count: int) -> List[Question]:
       

        questions = self._generate_question_answer_pairs(context, desired_count)
        questions = self._generate_distractors(context, questions)
        questions_lst = []
        for question in questions:
            qa = {}
            qa['question'] = question.questionText
            

            qa['answers'] = []
            qa['answers'].append({'text':question.answerText, 'correct':True})

            for option in question.distractors:
                qa['answers'].append({'text':option, 'correct':False})
            
            questions_lst.append(qa)

            print('-------------------')
            print(question.distractors)
            print(question.questionText)
            print(question.answerText)

        return questions_lst


    def generate_flashcard_pairs(self, context: str, desired_count: int) -> List[Question]:
        
        
        questions = self._generate_question_answer_pairs(context, desired_count)

        questions_lst=[]
        
        for question in questions:
            pair = {}
            pair['question'] = question.questionText
            pair['answer'] = question.answerText
            questions_lst.append(pair)
            print("-----------------------")
            print(question.questionText)
            print(question.answerText)

        return questions_lst


    def _generate_question_answer_pairs(self, context: str, desired_count: int) -> List[Question]:
        questions = []
        # math_questions = self.math_problem_generator.generate_math_problems(context,desired_count)
        # if not math_questions:
        context_splits = self._split_context_according_to_desired_count(context, desired_count)


        for split in context_splits:
            answer, question = self.question_generator.generate_qna(split)
            questions.append(Question(answer.capitalize(), question))
            questions = list(toolz.unique(questions, key=lambda x: x.answerText))
    # else:
        # for tup in math_questions:
        #     answer, question =  tup[1], tup[0]
        #     questions.append(Question(answer.capitalize(), question))

        
            

        return questions

    def _generate_distractors(self, context: str, questions: List[Question]) -> List[Question]:
        self.distractor_generator = DistractorGenerator()
        print('Loaded DistractorGenerator in', round(time.perf_counter() - self.start_time, 2), 'seconds.') if self.is_verbose else ''

        self.sense2vec_distractor_generator = Sense2VecDistractorGeneration()
        print('Loaded Sense2VecDistractorGenerator in', round(time.perf_counter() - self.start_time, 2), 'seconds.') if self.is_verbose else ''

        cleaned_text =  clean_text(context)
        for question in questions:
            t5_distractors =  self.distractor_generator.generate(18, question.answerText, question.questionText, cleaned_text)

            if len(t5_distractors) < 3:
                s2v_distractors = self.sense2vec_distractor_generator.generate(question.answerText, 3)
                distractors = s2v_distractors + t5_distractors
            
            else:
                distractors = t5_distractors
          
            math_pattern = r'[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?|[a-zA-Z]+\(.*?\)|[+\-*/^()]'
            if not re.search(math_pattern, question.answerText):
                distractors = remove_duplicates(distractors)
                distractors = remove_distractors_duplicate_with_correct_answer(question.answerText, distractors)
            


            question.distractors = distractors[:3]

        return questions

    

    def _split_context_according_to_desired_count(self, context: str, desired_count: int) -> List[str]:
        cleaned_text =  clean_text(context)
        sents = sent_tokenize(cleaned_text)
        sent_ratio = len(sents) / desired_count
         
        context_splits = []

        if sent_ratio < 1:
            return sents
        else:
            take_sents_count = int(sent_ratio + 1)

            start_sent_index = 0

            while start_sent_index < len(sents):
                context_split = ' '.join(sents[start_sent_index: start_sent_index + take_sents_count])
                context_splits.append(context_split)
                start_sent_index += take_sents_count - 1

        return context_splits
    






