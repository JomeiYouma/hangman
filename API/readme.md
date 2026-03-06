# Hangman 🪑

## API

This is a basic Express app that returns a random word in different languages.

### How to install

To run the app, first install the dependencies by running `npm install`. Then, start the server by running `npm run dev`. The server will be listening on port **3333** by default.

### How to use

To get a random word from the API, make a `POST` request to the root endpoint `/`. The API will return a JSON object with a single key word that contains the random word.

```http
POST /

Response:
{
  "word": "thermobarometer"
}
```

### Language support

To specify the desired language, include a `locale` key in the request body with one of the supported language codes.

```http
POST /

FormURLEncoded:
{
  "locale": "fr-FR"
}

Response:
{
  "word": "nomenclature"
}
```

If no locale key is included in the request body, the API will default to using British English.

### Supported locales

- `fr-FR`: French
- `en-GB`: British English

---

## React Project

### What needs to be done

**Using React, create a hangman game** that calls an API to get a random word to be guessed. The project will be graded on **functionality**, **code quality**, **design and styling**.

### Grading Criteria

#### Functionnality

The hangman game should be **functional** and display the **correct number of blank spaces** for the word that is being guessed. The user should be able to **enter letters** to guess the word, and the game should update to **show the correct letters and the hangman figure**.

The game should **handle errors gracefully** and display appropriate error messages if the API request fails.

Any other **extra feature is welcomed**.

(Using TypeScript properly will be rewarded)

#### Code Quality

The code should be **well-structured** and **easy to read**. You should use proper variable names and follow best practices for React development. The code should be **organized into reusable components** where appropriate.

#### Design and Styling

The game should be **visually appealing** and **user-friendly**, with an intuitive user interface. You should demonstrate your **proficiency in CSS** but the use of a helping library is allowed.
