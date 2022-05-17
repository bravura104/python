# Python code to
# import re module

# re module provides support
# for regular expressions
import re
 
# Make a regular expression for identifying a digit
regex = re.compile(r'^\$?(\d*(\d\.?|\.\d{1,2}))$')



     
# Define a function for
# identifying a Digit
def check(string):
     # pass the regular expression
     # and the string in search() method
    result = regex.match(string) 
    is_match = result is not None
    return is_match

L = []

# Using readlines()
file1 = open('myfile.txt', 'r')
Lines = file1.readlines()
  
count = 0
# Strips the newline character
for line in Lines:
    if count==0:
        L.append(line.replace("\n",""))
    if count==1:
        L.append(line.replace("\n",""))
    count += 1
    print("Line{}: {}".format(count, line.strip()))
    line1=line.replace("\n","",1)
    if check(line1):
        L.append("\t")
        L.append(line)
        count=0
                
# writing to file
file2 = open('myfile2.txt', 'w')
file2.writelines(L)
file2.close()     