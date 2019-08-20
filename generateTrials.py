import pandas as pd
import random, sys
from itertools import combinations

#def random_combination(iterable, r):
#	"Random selection from itertools.combinations(iterable, r)"
#	pool = tuple(iterable)
##	indices = sorted(random.sample(xrange(n), r))
#	return tuple(pool[i] for i in indices)

stims = pd.read_csv('allStims.csv')
#picNames = stims['picName'].tolist()
#allPairs = combinations(picNames,2)
#numStims = 120
#pairs=list(random_combination(allPairs,numStims))
catch = pd.read_csv('catch.csv')

subset = stims.sample(n=100)

df = pd.concat([subset, catch])
df = df.sample(n=102)


#df = pd.DataFrame.from_records(pairs, index=None, exclude=None, columns=('pic1','pic2'), nrows=None)
df.to_csv("trials/"+str(sys.argv[1])+"_trials.csv",index=False)

