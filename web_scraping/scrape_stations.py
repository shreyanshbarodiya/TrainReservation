import sys
import psycopg2
from bs4 import BeautifulSoup
from urllib3.util.retry import Retry
from urllib3 import PoolManager

retry = Retry(total=10, backoff_factor=0.5)
http = PoolManager(retries=retry, timeout=10.0)

rail_url = "https://www.cleartrip.com/trains/stations/list?page="
list_stations = []

for i in range(1, 6):
    page = http.request('GET', rail_url + str(i))
    # Parse the html in the 'page' variable, and store it in Beautiful Soup format
    soup = BeautifulSoup(page.data, "html.parser")
    table = soup.find('table', class_="results")
    tbody = table.find('tbody')

    for tr in tbody.find_all('tr'):
        td = tr.find_all('td')
        stn = {'code': str(td[0].text), 'name': str(td[1].text), 'city': str(td[2].text)}
        list_stations.append(stn)

######################################################################

hostname = '192.168.0.101'
username = 'vishal'
password = ''
database = 'postgres'
port = 5200

myConnection = psycopg2.connect(host=hostname, user=username, password=password, dbname=database, port=port)
cur = myConnection.cursor()
myConnection.autocommit = True
cur.execute("DELETE FROM station;")
for station in list_stations:
    query = "INSERT INTO station(station_id, name, city) VALUES('{}','{}','{}');".format(station['code'],
                                                                                         station['name'],
                                                                                         station['city'])
    try:
        cur.execute(query)
        print(query)
    except:
        sys.stderr.write("Unable to insert {}\n".format(station['code']))

myConnection.close()
