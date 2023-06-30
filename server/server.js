const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('dotenv').config(); // needed to read our environment variables

// the next 3 const integrate the openai API
const {Configuration, OpenAIApi} =  require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// this post function is a taken from openai quickstart example, but modified to work with expressjs
app.post('/api/generator', async (req, res) => {
  if (!configuration.apiKey) {
      res.status(500).json({
          error: {
              message: "OpenAI API key not configured, please follow instructions in README.md",
          }
      });
      return;
  }

  const animal = req.body.animal || '';
  if (animal.trim().length === 0) {
      res.status(400).json({
          error: {
              message: "Please enter a valid animal",
          }
      });
      return;
  }

  try {
      const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: generatePrompt(animal),
          temperature: 0.6,
      });
      res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
      // Consider adjusting the error handling logic for your use case
      if (error.response) {
          console.error(error.response.status, error.response.data);
          res.status(error.response.status).json(error.response.data);
      } else {
          console.error(`Error with OpenAI API request: ${error.message}`);
          res.status(500).json({
              error: {
              message: 'An error occurred during your request.',
              }
          });
      }
  }
  function generatePrompt(animal) {
  const capitalizedAnimal =
      animal[0].toUpperCase() + animal.slice(1).toLowerCase();
      return `Suggest three names for an animal that is a superhero.

      Animal: Cat
      Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
      Animal: Dog
      Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
      Animal: ${capitalizedAnimal}
      Names:`;
  }    
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})