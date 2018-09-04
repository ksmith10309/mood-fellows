# Mood Fellows

- **Author**: Hannah Sindorf, Brai Frauen, Katherine Smith
- **Version**: 1.0.8

## Overview
Blog that allows users to post anonymously. Posts are graded by the mood of the post by the Google Natural Language API - they will show an icon depending on whether the post is judged to be positive, negative, or neutral. Users can edit or delete posts they make by using an ID given when the post is made.

## Getting Started
Visit [http://mood-fellows.herokuapp.com/](http://mood-fellows.herokuapp.com/) to go to the app.

### Home
1. View posts by scrolling down the page 
- new posts will be listed first.
- Posts are graded by the mood of the post by the Google Natural Language API - they will show an icon depending on whether the post is judged to be positive, negative, or neutral.
2. If you have a post's secret ID, you can delete the post or edit the post by clicking the corresponding buttons.

### New Post
1. Click "New Post" at the top menu.
1. Type in your post content in the text field.
1. Click submit.
1. You will be given a secret ID upon successful submit of your post - take note of this if you would like to edit or remove your post later.
1. You will be returned to the homepage to view new posts - your post will be graded by the mood of the post by the Google Natural Language API.

### About
1. Click "About" at the top of the page. This page lists information about the technologies used and creators.

## Architecture

### Frontend Technologies
- HTML
- CSS
- JavaScript

### Backend Technologies
- Node.js
- Express.js
- PostgreSQL
- SuperAgent
- EJS

### APIs and other external resources
- Google Natural Language API - Sentiment Analyzer

## Change Log

### 1.0.x
- 09-04-2018 - 1.0.8 - Functioning posting, API calls
- 09-04-2018 - 1.0.7 - Added images to images directory
- 09-04-2018 - 1.0.6 - Added menu, basic page structure and styling
- 09-04-2018 - 1.0.5 - Added new post template
- 09-04-2018 - 1.0.4 - Added home template to display posts
- 09-04-2018 - 1.0.3 - Server updated with get routes
- 09-04-2018 - 1.0.2 - File structure for templates
- 09-04-2018 - 1.0.1 - Updated documentation
- 08-31-2018 - 1.0.0 - Initial release - set up repo, heroku hosting

## Credits and Collaborations
