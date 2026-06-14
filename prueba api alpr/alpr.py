import requests

url = "https://api.platerecognizer.com/v1/plate-reader/"
token = "0a812161937ea3271ea984f6ba7ccd41ea0686c2"

with open("camion2.jpg", "rb") as fp:
    response = requests.post(
        url,
        files=dict(upload=fp),
        headers={"Authorization": f"Token {token}"}
    )

print(response.json())