from urllib.request import urlopen
from bs4 import BeautifulSoup
import sys

def getType(train_name,classes):
	if 'Superfast' in train_name:
		return 'Superfast'
	elif 'Special' in train_name:
		classes.extend(['2A','3A','SL','GEN'])
		return 'Special'
	elif 'Rajdhani' in train_name:
		classes.extend(['1A','2A','3A'])
		return 'Rajdhani'
	elif 'Duronto' in train_name:
		classes.extend(['1A','2A','3A'])
		return 'Duronto'
	elif 'Mail' in train_name:
		classes.extend(['2A','3A','SL','GEN'])
		return 'Mail'
	elif 'Intercity' in train_name:
		classes.extend(['SL','CC','2S'])
		return 'Intercity'
	elif 'Garib' in train_name:
		classes.extend(['3A','CC'])
		return 'Garib Rath'
	elif 'Premium' in train_name:
		classes.extend(['2A','3A','SL','GEN'])
		return 'Premium'
	else:
		classes.extend(['1A','2A','3A','SL','GEN'])
		return 'Express'

######################################################################

hostname = '192.168.0.101'
username = 'vishal'
password = ''
database = 'postgres'
port = 5200

#stored as {<coach_class> : [num_coaches, coach_code, capacity]}
coach_info = {'1A':[1,'H',18], '2A':[2,'A',48], '3A':[4,'B',64], 'SL':[10,'S',72], 'CC':[3,'C',67], '2S':[4,'D',108]}
day_of_week = {'M':1, 'T':2, 'W':3, 'Th':4, 'F':5, 'Sa':6, 'Su':0}
import psycopg2
myConnection = psycopg2.connect( host=hostname, user=username, password=password, dbname=database, port=port)
cur = myConnection.cursor()
myConnection.autocommit = True
query = "DELETE FROM train; DELETE FROM coach; DELETE FROM schedule; DELETE FROM runs_on;"
myConnection.commit()
cur.execute(query)

url = "https://www.cleartrip.com/trains/"

for i in range(1,5):
	page = urlopen(url+"list?page="+str(i))
	#Parse the html in the 'page' variable, and store it in Beautiful Soup format
	soup = BeautifulSoup(page, "html.parser")
	table = soup.find('table', class_="results")
	tbody = table.find('tbody')

	for tr in tbody.find_all('tr'):
		train = {}
		td = tr.find_all('td')
		train['trnno'] = str(td[0].text)
		train['name'] = str(td[1].text)
		classes = []
		train['type'] = getType(train['name'], classes)
		
		query = "INSERT INTO train VALUES('{}','{}','{}');".format(train['trnno'], train['name'], train['type'])
		try:
			cur.execute(query)
			print(query)
		except Exception as inst:
			sys.stderr.write("Unable to insert train {} {}\n".format(train['trnno'], inst))
			continue

		for class_ in classes:
			if class_ in coach_info.keys():
				for j in range(1,coach_info[class_][0]+1):
					query = "INSERT INTO coach VALUES('{}','{}','{}','{}');".format(train['trnno'], coach_info[class_][1]+str(j), class_, coach_info[class_][2])
					try:
						cur.execute(query)
						print(query)
					except Exception as inst:
						sys.stderr.write("Unable to insert coach {} {} {}\n".format(train['trnno'], class_, inst))
						continue
		#try:
		page_ = urlopen(url+train['trnno'])
		#except Exception as inst:
		#	sys.stderr.write("Unable to get schedule {} {}\n".format(train['trnno'], inst))
		#	continue
			
		soup_ = BeautifulSoup(page_, "html.parser")
		table_ = soup_.find_all('table', class_="results")
		if len(table_) < 2:
			continue
		schedule = {}
		table__ = table_[1]
		for tr in table__.find_all('tr'):
			td = tr.find_all('td')
			schedule['count'] = str(td[0].text).strip()
			stn = str(td[1].text)
			schedule['stn'] = stn[stn.rfind('(')+1:stn.rfind(')')]
			schedule['arr'] = str(td[2].text).strip()
			if schedule['arr'] == 'Starts':
				schedule['arr'] = None;
			schedule['dept'] = str(td[3].text).strip()
			if schedule['dept'] == 'Ends':
				schedule['dept'] = None;
			schedule['dist'] = str(td[5].text).strip().split(' ')[0]
			schedule['day'] = str(td[6].text).strip()
			
			if schedule['arr'] == None:
				query = "INSERT INTO schedule VALUES('{}','{}',null,'{}','{}','{}','{}');".format(train['trnno'], schedule['stn'], schedule['dept'], schedule['count'], schedule['day'], schedule['dist'])
			elif schedule['dept'] == None:
				query = "INSERT INTO schedule VALUES('{}','{}','{}',null,'{}','{}','{}');".format(train['trnno'], schedule['stn'], schedule['arr'], schedule['count'], schedule['day'], schedule['dist'])
			else:
				query = "INSERT INTO schedule VALUES('{}','{}','{}','{}','{}','{}','{}');".format(train['trnno'], schedule['stn'], schedule['arr'], schedule['dept'], schedule['count'], schedule['day'], schedule['dist'])
			try:
				cur.execute(query)
				print(query)
			except Exception as inst:
				sys.stderr.write("Unable to insert schedule {} {} : {}\n".format(train['trnno'], schedule['stn'], inst))
				continue

		ul = soup_.find('ul', class_="summaryInfo clearfix")
		li = ul.find_all('li')[2]
		li.small.extract()
		days = str(li.text).strip().split(', ')
		for day in days:
			query = "INSERT INTO runs_on VALUES('{}','{}');".format(train['trnno'], day_of_week.get(day))
			try:
				cur.execute(query)
				print(query)
			except Exception as inst:
				sys.stderr.write("Unable to insert runs_on {} {}: {}\n".format(train['trnno'], day, inst))
				break