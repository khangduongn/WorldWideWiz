# World Wide Wiz - A Geography Quiz Web Application
World Wide Wiz is a geography quiz web application that provides an interactive and fun way for users to take geography quizzes (map or standard quizzes) and create their own quizzes to share with other users. There is a social aspect to the app where users can view other users' accounts, including their scores on quizzes that they have taken. Users can compete with other users to obtain the highest scores on different geography quizzes.

Technologies used:
* Front-end: ReactJS and MaterialUI
* Back-end: Node.js and Express.js
* Database: PostgreSQL with Prisma serving as the ORM 

## Requirements
Make sure you have PostgreSQL installed and a PostgreSQL database server started.\
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