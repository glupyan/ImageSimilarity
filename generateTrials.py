import pandas as pd
import random, sys
from itertools import combinations

def random_combination(iterable, r):
	"Random selection from itertools.combinations(iterable, r)"
	pool = tuple(iterable)
	n = len(pool)
	indices = sorted(random.sample(xrange(n), r))
	return tuple(pool[i] for i in indices)

stims = pd.read_csv('allStims.txt',sep="\t")
picNames = stims['picName'].tolist()
allPairs = combinations(picNames,2)
numStims = 120
pairs=list(random_combination(allPairs,numStims))
df = pd.DataFrame.from_records(pairs, index=None, exclude=None, columns=('pic1','pic2'), nrows=None)
df.to_csv("trials/"+str(sys.argv[1])+"_trials.csv",index=False)