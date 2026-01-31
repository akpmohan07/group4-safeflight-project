###Steps to set up the project:-

Clone the repository on your machine.

GitHub - harrishdhaithya/group4-safeflight-project

Install the latest node version from the URL, if not available on your machine.

Node.js — Download Node.js®

##Project Structure:

<img src="images/filestruct.png">


##Important Files and Folders:

src/main/java → This is the place where all the Java files are stored.

src/main/webapp → This is the place where all the front-end code lives

src/main/resources/application.properties → All the logging configuration lives here.

src/main/resources/static → This is the place where the build files are copied after building the React code.

src/build.gradle → This is the place where all the Gradle configurations live.

src/.gitignore → All the untracked files and folders have to be mentioned here.

##To Build the Project:

Open the terminal/command prompt in the project folder.



./gradlew build
##To delete all the Files that are built:



./gradlew clean


Note: ./gradlew build will only compile the changes made iteratively. If you want to build full project, use:-



./gradlew clean build


To run the build:



java -jar build/libs/safeflight-0.0.1-SNAPSHOT.jar


Note: Changes in React files won't appear until the project is built. To see changes immediately, run the front end separately and access it via the React app's URL. Steps are given below:-

Open the terminal/command prompt inside src/main/webapp



npm start
Proxy is configured in the package.json file, so all API calls redirect to the backend. If your backend runs on a different port, update the proxy URL.

<img src="images/package-json.png"/>
 


