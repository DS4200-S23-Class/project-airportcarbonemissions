import requests
from pprint import pprint   # pretty-print
import json
import pandas as pd

# all flights depart from boston
url = "https://aerodatabox.p.rapidapi.com/airports/icao/KBOS/stats/routes/daily"
# all flights depart from jfk
url2 = "https://aerodatabox.p.rapidapi.com/airports/icao/KJFK/stats/routes/daily"

headers = {
    "X-RapidAPI-Key": "af7faaf9e5mshd76a87cec560fa0p136031jsn180f27c2635b",
    "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com"
}

def manipulate_response(url, headers):
    response = requests.request("GET", url, headers=headers)
    json_data = response.json()
    json_data = json.dumps(json_data)
    data = json.loads(json_data)

    return data

def manipulate_df(data, from_iata):
    df = pd.DataFrame.from_dict(data['routes'])
    new_df = pd.DataFrame()
    for index, dic in df['destination'].items():
        dic['lat'] = dic['location']['lat']
        dic['lon'] = dic['location']['lon']
        del dic['location']
        small_df = pd.DataFrame(dic, index=[0])
        new_df = pd.concat([new_df, small_df])

    new_df = new_df.reset_index(drop=True)
    new_df['from'] = from_iata
    new_df['averageDailyFlights'] = df['averageDailyFlights']

    return new_df


data_bos = manipulate_response(url, headers)
data_jfk = manipulate_response(url2, headers)

bos_df = manipulate_df(data_bos, 'BOS')
jfk_df = manipulate_df(data_jfk, 'JFK')
df = pd.concat([bos_df, jfk_df]).reset_index(drop=True)
del df['localCode']

#df.to_csv("output.csv")

print(df.to_string())
