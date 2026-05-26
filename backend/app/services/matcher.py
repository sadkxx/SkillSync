import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def calculate_similarity(vec1, vec2):
    vec1 = vec1.reshape(1, -1)
    vec2 = vec2.reshape(1, -1)
    score = cosine_similarity(vec1, vec2)[0][0]
    return float(score)