# English Teaching Templates and Exercises

# These templates will be used to generate structured English lessons

EXERCISE_TEMPLATES = {
    # Grammar exercises for different levels
    'grammar': {
        'beginner': [
            "Practice using the verb '{verb}' in present tense with 5 example sentences.",
            "Complete these sentences with the correct form of 'to be': {sentences}",
            "Create 5 questions using the question words (what, where, when, who, why).",
            "Fill in the blanks with 'a' or 'an': {sentences}",
            "Change these sentences from positive to negative: {sentences}"
        ],
        'intermediate': [
            "Rewrite these sentences using the passive voice: {sentences}",
            "Complete these sentences with the correct conditional form: {sentences}",
            "Use the correct form of the verbs in these past perfect sentences: {sentences}",
            "Combine these pairs of sentences using relative clauses: {pairs}",
            "Rewrite the dialogue using reported speech: {dialogue}"
        ],
        'advanced': [
            "Correct the grammatical errors in these sentences: {sentences}",
            "Rewrite these sentences using inversion: {sentences}",
            "Complete these sentences with the appropriate modal verbs of deduction: {sentences}",
            "Transform these sentences using cleft structures (It was... that/who): {sentences}",
            "Rewrite these sentences using participle clauses: {sentences}"
        ]
    },
    
    # Vocabulary exercises for different levels
    'vocabulary': {
        'beginner': [
            "Match these words with their definitions: {words_and_definitions}",
            "Fill in the blanks with one of these words: {word_list}. Sentences: {sentences}",
            "Name 5 items you can find in a {location}.",
            "Write 3 sentences using the word '{word}'.",
            "Group these words into categories: {words}"
        ],
        'intermediate': [
            "Replace the underlined words with a more precise synonym: {sentences}",
            "Complete the collocations with the appropriate word: {collocations}",
            "Use these phrasal verbs in sentences: {phrasal_verbs}",
            "Explain the difference between these pairs of commonly confused words: {word_pairs}",
            "Complete these idioms and explain their meanings: {idioms}"
        ],
        'advanced': [
            "Explain the connotations of these near-synonyms and use each in a sentence: {words}",
            "Use these academic vocabulary words in complex sentences: {words}",
            "Identify the register (formal/informal) of these expressions and provide an equivalent in the opposite register: {expressions}",
            "Explain the nuanced differences between these synonyms: {synonyms}",
            "Use these advanced idiomatic expressions in professional context sentences: {expressions}"
        ]
    },
    
    # Conversation practice for different levels
    'conversation': {
        'beginner': [
            "Practice this dialogue about ordering food at a restaurant: {dialogue}",
            "Answer these questions about your daily routine.",
            "Describe your family members using at least 5 different adjectives.",
            "Practice asking for directions to these places: {places}",
            "Introduce yourself and ask 3 questions to get to know someone new."
        ],
        'intermediate': [
            "Discuss your opinion on {controversial_topic} providing arguments for both sides.",
            "Role-play a job interview for the position of {job_position}.",
            "Describe a problem you've encountered and how you solved it.",
            "Give detailed instructions on how to {process}.",
            "Narrate a story based on these sequential images: {image_descriptions}"
        ],
        'advanced': [
            "Debate the pros and cons of {complex_topic} from multiple perspectives.",
            "Deliver a 2-minute persuasive speech on {topic}.",
            "Participate in this simulated business negotiation scenario: {scenario}",
            "Discuss cultural differences between {country1} and {country2} in these social contexts: {contexts}",
            "Present a solution to this complex problem: {problem}"
        ]
    },
    
    # Reading exercises for different levels
    'reading': {
        'beginner': [
            "Read this short passage and answer the questions: {passage_and_questions}",
            "Match these sentences with the appropriate pictures: {sentences_and_pictures}",
            "Read these instructions and put them in the correct order: {instructions}",
            "Fill in the missing words in this short story: {story_with_blanks}",
            "Read this simple email and reply to it: {email}"
        ],
        'intermediate': [
            "Read this article and identify the main ideas of each paragraph: {article}",
            "Answer these inference questions based on the text: {text_and_questions}",
            "Identify fact vs. opinion in this news article: {article}",
            "Read this review and summarize the positive and negative points: {review}",
            "Complete this text with the missing sentences: {text_and_sentences}"
        ],
        'advanced': [
            "Analyze the author's tone and purpose in this text: {text}",
            "Read this academic abstract and explain the research methodology and findings: {abstract}",
            "Identify the literary devices used in this excerpt and explain their effect: {excerpt}",
            "Critically evaluate the arguments presented in this opinion piece: {opinion_piece}",
            "Compare and contrast these two texts discussing the same topic: {text1} {text2}"
        ]
    },
    
    # Writing exercises for different levels
    'writing': {
        'beginner': [
            "Write 5 sentences describing this picture: {picture_description}",
            "Write a short paragraph about your favorite {topic}.",
            "Complete this story using your own ideas: {story_starter}",
            "Write a short email to a friend about your weekend.",
            "Describe your daily routine using time expressions (first, then, after that, finally)."
        ],
        'intermediate': [
            "Write a formal email requesting information about {service}.",
            "Write a paragraph comparing and contrasting {item1} and {item2}.",
            "Write a review of a {review_item} you recently experienced.",
            "Write a letter of complaint about a {problem}.",
            "Write a narrative paragraph about a memorable experience."
        ],
        'advanced': [
            "Write a persuasive essay arguing for or against {controversial_topic}.",
            "Write a formal report analyzing the causes and effects of {issue}.",
            "Write a summary and critical response to this article: {article}",
            "Write a cover letter applying for the position of {job_position}.",
            "Write a proposal suggesting solutions to {problem}."
        ]
    },
    
    # Pronunciation exercises for different levels
    'pronunciation': {
        'beginner': [
            "Practice saying these minimal pairs: {minimal_pairs}",
            "Mark the stressed syllable in these words: {words}",
            "Practice saying the alphabet with proper English pronunciation.",
            "Read aloud these sentences focusing on intonation: {sentences}",
            "Practice saying these numbers and dates: {numbers_and_dates}"
        ],
        'intermediate': [
            "Practice linking words in these sentences: {sentences}",
            "Practice these sentences focusing on the /θ/ and /ð/ sounds: {sentences}",
            "Mark and practice the stressed words in these sentences: {sentences}",
            "Practice these sentences with rising and falling intonation: {sentences}",
            "Read this dialogue with appropriate rhythm and stress: {dialogue}"
        ],
        'advanced': [
            "Practice these sentences with challenging consonant clusters: {sentences}",
            "Practice these tongue twisters focusing on specific sounds: {tongue_twisters}",
            "Record yourself reading this passage and analyze your pronunciation: {passage}",
            "Practice these sentences focusing on connected speech features (assimilation, elision): {sentences}",
            "Practice shifting stress in these words that change form (noun vs. verb): {word_pairs}"
        ]
    },
    
    # Exam preparation for different exams
    'exam': {
        'IELTS': [
            "Practice this IELTS Writing Task 1 describing a {chart_type}: {chart_description}",
            "Practice this IELTS Writing Task 2 essay question: {essay_question}",
            "Practice for IELTS Speaking Part 2 with this cue card: {cue_card}",
            "Answer these IELTS Reading questions based on this passage: {passage_and_questions}",
            "Listen to this IELTS-style recording and answer the questions: {audio_description}"
        ],
        'TOEFL': [
            "Practice this TOEFL independent writing question: {question}",
            "Prepare and speak for 45 seconds about this TOEFL speaking question: {question}",
            "Practice this TOEFL integrated writing task based on this lecture and reading: {lecture_and_reading}",
            "Answer these TOEFL reading questions based on this passage: {passage_and_questions}",
            "Practice note-taking for this TOEFL lecture: {lecture}"
        ],
        'Cambridge': [
            "Complete this Use of English exercise for Cambridge Advanced: {exercise}",
            "Write an essay for Cambridge First Certificate based on this prompt: {prompt}",
            "Practice this Cambridge speaking exercise with a partner: {exercise}",
            "Complete this transformations exercise for Cambridge Proficiency: {exercise}",
            "Practice this word formation exercise for Cambridge Advanced: {exercise}"
        ]
    }
}

# Lesson plans for different topics and levels
LESSON_PLANS = {
    'grammar': {
        'present_simple': {
            'title': "Present Simple Tense",
            'structure': [
                "1. Introduction: The present simple tense is used for habits, routines, facts, and general truths.",
                "2. Form: Positive: Subject + base verb (+ s/es for third person singular)",
                "3. Form: Negative: Subject + don't/doesn't + base verb",
                "4. Form: Question: Do/Does + subject + base verb?",
                "5. Time expressions: always, usually, often, sometimes, rarely, never, every day, etc.",
                "6. Examples of each use case",
                "7. Practice exercises",
                "8. Common mistakes to avoid"
            ]
        },
        'past_tense': {
            'title': "Past Simple vs. Past Continuous",
            'structure': [
                "1. Introduction: When to use past simple and past continuous",
                "2. Form: Past Simple: Subject + verb in past tense / Subject + didn't + base verb",
                "3. Form: Past Continuous: Subject + was/were + verb-ing",
                "4. Uses: Past Simple for completed actions, Past Continuous for actions in progress",
                "5. Signal words for each tense",
                "6. Examples combining both tenses",
                "7. Practice exercises",
                "8. Common mistakes to avoid"
            ]
        }
    },
    'vocabulary': {
        'travel': {
            'title': "Travel Vocabulary",
            'structure': [
                "1. Introduction: Why learning travel vocabulary is important",
                "2. Types of transportation and related vocabulary",
                "3. Accommodation vocabulary",
                "4. Tourist attractions and activities",
                "5. Problems and solutions while traveling",
                "6. Useful phrases for asking for directions and information",
                "7. Practice exercises",
                "8. Real-life application scenarios"
            ]
        },
        'business': {
            'title': "Business English Vocabulary",
            'structure': [
                "1. Introduction: The importance of business English",
                "2. Company structure and job titles",
                "3. Meeting vocabulary and phrases",
                "4. Negotiation language",
                "5. Email writing vocabulary and phrases",
                "6. Finance and marketing terminology",
                "7. Practice exercises",
                "8. Role-play scenarios"
            ]
        }
    }
}

# Common English teaching methodologies to recommend
TEACHING_METHODOLOGIES = [
    {
        "name": "Communicative Language Teaching (CLT)",
        "description": "Focuses on interactive communication and real-life language use. Activities include role-plays, information gaps, and authentic conversations.",
        "best_for": "Developing speaking fluency and confidence in real-world situations"
    },
    {
        "name": "Task-Based Learning",
        "description": "Organizes learning around completing meaningful tasks, where language is the tool rather than the object of study. For example, planning a trip or creating a presentation.",
        "best_for": "Building problem-solving skills while learning practical language use"
    },
    {
        "name": "Lexical Approach",
        "description": "Emphasizes vocabulary learning through chunks of language (collocations, fixed expressions, idioms) rather than individual words.",
        "best_for": "Improving natural-sounding speech and writing with proper collocations"
    },
    {
        "name": "Total Physical Response (TPR)",
        "description": "Links language learning with physical movements and actions. Particularly effective for beginners and kinesthetic learners.",
        "best_for": "Beginner learners and teaching action verbs or commands"
    },
    {
        "name": "Flipped Classroom",
        "description": "Students study content independently before class, then use class time for practice, discussion, and clarification.",
        "best_for": "Making the most of limited class time by focusing on application and practice"
    }
]