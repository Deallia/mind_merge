from typing import List, Dict, Tuple
from tqdm.notebook import tqdm
import pytorch_lightning as pl
from sklearn.model_selection import train_test_split
from transformers import (
    AdamW,
    T5ForConditionalGeneration,
    T5TokenizerFast as T5Tokenizer
    )


MODEL_NAME = 't5-small'
LEARNING_RATE = 0.0001
max_length = 300
SEP_TOKEN = '<sep>'
TOKENIZER_LEN = 32101 


class QAModel(pl.LightningModule):
    def __init__(self):
        super().__init__()
        self.model = T5ForConditionalGeneration.from_pretrained(MODEL_NAME, return_dict=True)
        self.model.resize_token_embeddings(TOKENIZER_LEN) 
    def forward(self, input_ids, attention_mask, labels=None):
        output = self.model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
        return output.loss, output.logits
    

    def training_step(self, batch, batch_idx):
        input_ids = batch['input_ids']
        attention_mask = batch['attention_mask']
        labels = batch['labels']
        loss, output = self(input_ids, attention_mask, labels)
        self.log('train_loss', loss, prog_bar=True, logger=True)
        return loss

    def validation_step(self, batch, batch_idx):
        input_ids = batch['input_ids']
        attention_mask = batch['attention_mask']
        labels = batch['labels']
        loss, output = self(input_ids, attention_mask, labels)
        self.log('val_loss', loss, prog_bar=True, logger=True)
        return loss

    def test_step(self, batch, batch_idx):
        input_ids = batch['input_ids']
        attention_mask = batch['attention_mask']
        labels = batch['labels']
        loss, output = self(input_ids, attention_mask, labels)
        self.log('test_loss', loss, prog_bar=True, logger=True)
        return loss
  
    def configure_optimizers(self):
        return AdamW(self.parameters(), lr=LEARNING_RATE)


class QuestionGenerator():
    def __init__(self):
        self.tokenizer = T5Tokenizer.from_pretrained(MODEL_NAME)
        self.tokenizer.add_tokens(SEP_TOKEN)
        self.tokenizer_len = len(self.tokenizer)

        checkpoint_path = 'ml_app/models/question-answer.ckpt'
        self.qg_model = QAModel.load_from_checkpoint(checkpoint_path)
        self.qg_model.freeze()
        self.qg_model.eval()

    

    def generate_qna(self, context: str) -> Tuple[str, str]:
        answer_mask = '[MASK]'
        model_output = self._model_predict(answer_mask, context)

        qna_pair = model_output.split('<sep>')

        if len(qna_pair) < 2:
            generated_answer = ''
            generated_question = qna_pair[0]
        else:
            generated_answer = qna_pair[0]
            generated_question = qna_pair[1]

        return generated_answer, generated_question

    def _model_predict(self, answer: str, context: str) -> str:
        source_encoding = self.tokenizer(
            '{} {} {}'.format(answer, SEP_TOKEN, context),
            max_length=max_length,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            add_special_tokens=True,
            return_tensors='pt'
        )

        generated_ids = self.qg_model.model.generate(
            input_ids=source_encoding['input_ids'],
            attention_mask=source_encoding['attention_mask'],
            num_beams=16,
            max_length=max_length,
            repetition_penalty=2.5,
            length_penalty=1.0,
            early_stopping=True,
            use_cache=True
        )

        preds = {
            self.tokenizer.decode(generated_id, skip_special_tokens=True, clean_up_tokenization_spaces=True)
            for generated_id in generated_ids
        }

        return ''.join(preds)


# Not fit for use
import random
import math

class MathProblemGenerator():

    def __init__(self):
        self.math_concepts = {
            'permutation': ['permutation'],
            'combination': ['combination'],
            'factorial': ['factorial', 'n!', 'permutation'],
            'inequality': ['inequality'],
            'limit': [ 'infinity', 'function approaches', 'sequence approaches'],
            'derivative': ['derivative', 'slope', 'tangent']
        }
        

    def generate_math_problems(self, text: str, count:int) -> List[Tuple[str, str]]:
        # Identify key mathematical concepts or formulas from the text
        concepts = self.extract_mathematical_concepts(text)
        
        # Generate math problems based on the identified concepts
        math_problems = False
        if concepts !=[]:
            math_problems = self.generate_problems(concepts, count)
       
        
        return math_problems 

    def extract_mathematical_concepts(self, text: str) -> List[str]:
        # Identify mathematical concepts from the text using associated keywords/phrases
        concepts_found = set()
        for concept, keywords in self.math_concepts.items():
            for keyword in keywords:
                if keyword in text.lower():
                    concepts_found.add(concept)
                    break 
        if "combination" in concepts_found and "permutation" not in concepts_found:
            concepts_found.remove("combination") # Stop searching for this concept if any keyword is found
        return list(concepts_found)
    
    def generate_problems(self, concepts: List[str], count: int) -> List[Tuple[str, str]]:
        # Define a list to store the generated problems
        problems = []
        
        if len(concepts)%count==0:
            count_per_concept = int(len(concepts)/count)
        elif count%len(concepts)==0:
            count_per_concept = int(count/len(concepts))
        elif len(concepts)%count >=1 :
            count_per_concept = int(len(concepts)/count)+1
        elif count%len(concepts) >=1:
            count_per_concept = int(count/len(concepts))+1
        # Generate math problems for each concept
        for concept in concepts:
            problems.extend(self.generate_problems_for_concept(concept, count_per_concept))

        return problems

    def generate_problems_for_concept(self, concept: str, count: int) -> List[Tuple[str, str]]:
        # Define a list to store the generated problems for the given concept
        problems_for_concept = []

        # Generate math problems based on the given concept
        if concept == 'permutation':
            for _ in range(count):
                n = random.randint(3, 6)
                k = random.randint(1, n)
                problem_statement = f"What is the number of permutations of {n} distinct objects taken {k} at a time?"
                solution = str(self.calculate_permutations(n, k))
                problems_for_concept.append((problem_statement, solution))
        elif concept == 'combination':
            for _ in range(count):
                n = random.randint(3, 6)
                k = random.randint(1, n)
                problem_statement = f"What is the number of combinations of {n} distinct objects taken {k} at a time?"
                solution = str(self.calculate_combinations(n, k))
                problems_for_concept.append((problem_statement, solution))
        elif concept == 'factorial':
            for _ in range(count):
                n = random.randint(3, 8)
                problem_statement = f"What is the value of {n} factorial?"
                solution = str(self.calculate_factorial(n))
                problems_for_concept.append((problem_statement, solution))
       
        elif concept == 'derivative':
            a, b = random.randint(1, 5), random.randint(1, 5)
            problem_statements = [
                f"Find the derivative of f(x) = {a}x^3 + {b}x^2.",
                f"Calculate the derivative of g(x) = {a}x^2 + {b}x.",
                f"Find the derivative of h(x) = {a}sin(x) + {b}cos(x).",
                f"Compute the derivative of i(x) = {a}x^4 + {b}x^3.",
                f"Determine the derivative of j(x) = {a}ln(x) + {b}e^x."
            ]
            solutions = [
                f"3*{a}x^2 + 2*{b}x",
                f"2*{a}x + {b}",
                f"{a}cos(x) - {b}sin(x)",
                f"4*{a}x^3 + 3*{b}x^2",
                f"{a}/x + {b}e^x"
            ]
            for _ in range(count):
                index = random.randint(0, len(problem_statements) - 1)
                problem_statement = problem_statements[index]
                solution = solutions[index]
                problems_for_concept.append((problem_statement, solution))
        
        elif concept == 'limit':
            a, b = random.randint(1, 5), random.randint(1, 5)
            problem_statements = [
                f"Find the limit of f(x) = {a}x^2 + {b}x as x approaches infinity.",
                f"Calculate the limit of g(x) = {a}sin(x) + {b}cos(x) as x approaches 0.",
                f"Determine the limit of h(x) = {a}/x + {b}/x^2 as x approaches infinity.",
                f"Find the limit of i(x) = {a}x^3 - {b}x^2 as x approaches -infinity.",
                f"Compute the limit of j(x) = {a}sin(x)/{b}x as x approaches 0."
            ]
            solutions = [
                "positive infinity",
                f"{b}",
                "0",
                "negative infinity",
                f"{a}/{b}"
            ]
            for _ in range(count):
                index = random.randint(0, len(problem_statements) - 1)
                problem_statement = problem_statements[index]
                solution = solutions[index]
                problems_for_concept.append((problem_statement, solution))

        return problems_for_concept
        
    
    def calculate_permutations(self, n: int, k: int) -> int:
        return math.factorial(n) // math.factorial(n - k)

    def calculate_combinations(self, n: int, k: int) -> int:
        return math.factorial(n) // (math.factorial(k) * math.factorial(n - k))

    def calculate_factorial(self, n: int) -> int:
        return math.factorial(n)
    

    def paraphrase_problems(self, problems: List[Dict[str, str]]) -> List[Dict[str, str]]:
        # Paraphrase problem statements using T5 paraphrasing pipeline
        for problem in problems:
            problem['problem_statement'] = self.generate_dynamic_problem_statement(problem['problem_statement'])
        return problems

    def generate_dynamic_problem_statement(self, prompt):
        inputs = self.tokenizer(prompt, return_tensors="pt", padding=True, truncation=True)
        translated = self.model.generate(**inputs)
        paraphrase = self.tokenizer.decode(translated[0], skip_special_tokens=True)
        return paraphrase
    


        