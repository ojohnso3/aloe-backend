# Aloe Stories: Backend Architecture

## Summary
**Content Warning: Please be advised before reading on  —  our research includes sensitive topics, such as sexual assault.**

Aloe Stories is a safe and inclusive iOS platform that aims to normalize conversations around impactful sexual experiences, with the goal of improving unhealthy sex culture and fostering a healing community. We eventually landed on this solution because of our shared passion for supporting survivors of sexual assault, which is a pervasive issue that has very few existing technological services.

Please feel free to check out our [Medium Article](https://medium.com/@olivia7227/aloe-stories-building-an-ios-app-from-scratch-2c91f540fe9a) to learn more about the motivations behind our iOS app and our 9 month-long development process.

## Navigating the Repository
While Express.js applications are generally lean, this repository includes countless files, making it a bit difficult to find the core programming logic. The majority of code powering this backend is located in the “functions” folder. I’ve included a quick guide on the most important folders in “functions” below:

1. Controllers: contains all the endpoints and backend logic powering the application.
2. Routes: index.js has all routing requests for the backend, while users.js is specifically for Firebase Auth.
3. Firebase: enables the Firestore database connection and the Firebase Auth SDK.
4. Firestore: includes dormant scripts and json objects used to upload data for MVP testing.

## Specifications
A user should be able to:
- Sign up for a new account
- Login to their existing account
- Create, edit, or remove their post
- Create or remove their comment
- Like a post or comment
- Access or edit their profile
- View their created posts
- View their liked posts
- View all posts with pagination
- View all comments with pagination
- Know if they previously liked a post or comment

All these actions are associated with endpoints created in the controllers folder.

## Design
To learn more about the backend design process, check out our [Medium Article](https://medium.com/@olivia7227/aloe-stories-building-an-ios-app-from-scratch-2c91f540fe9a) that includes a breakdown of Aloe’s tech stack. It discusses the technical implementation of the app’s backend architecture, including context on the tradeoffs between NoSQL and SQL databases, considerations around user security, and insight into the complex functionality required for a dynamic feed of posts.
