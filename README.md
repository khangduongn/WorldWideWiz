## Requirements
Make sure you have postgres installed and a postgres server started.\
Do not run the web app on Safari, preferably use Chrome.
## Steps to Run the Web App Locally
Clone the repo and cd into the project directory
```
git clone https://github.com/khangduongn/WorldWideWiz.git
cd WorldWideWiz
```
Open up 2 terminals.\
On terminal number 1, running the following commands:
```
cd back
npm i
```
Create a new file called ```.env``` in the ```prisma``` directory and add the following line in it replacing ```USER```, ```PASSWORD```, ```HOST```, ```PORT```, and ```DATABASE``` with your postgres credentials (you can run the following command as a shortcut, filling in with your details)
```
echo 'DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"' > ./prisma/.env 
npx prisma migrate reset
npm run all
```
On terminal number 2, run the following commands
```
cd front
npm i
npm run dev
```
Navigate to the url provided (most probably localhost:5173)