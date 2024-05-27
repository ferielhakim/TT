const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const DATASET_URLS = {
  espacesVerts: 'https://parisdata.opendatasoft.com/api/records/1.0/search/?dataset=ilots-de-fraicheur-espaces-verts-frais&rows=1000',
  fontaines: 'https://parisdata.opendatasoft.com/api/records/1.0/search/?dataset=fontaines-a-boire&rows=1000',
  equipements: 'https://parisdata.opendatasoft.com/api/records/1.0/search/?dataset=ilots-de-fraicheur-equipements-activites&rows=1000'

};


app.get('/', (req, res) => {
  res.send('Welcome to the Chill Spots Paris API');
});

app.get('/api/search', async (req, res) => {
  try {
    const espacesVertsResponse = await axios.get(DATASET_URLS.espacesVerts);
    const espacesVerts = espacesVertsResponse.data.records;

    // Liste des types spécifiés
    const allowedTypes = [
      'Bois',
      'Cimetières',
      'Cimetières non parisiens',
      'Décorations sur la voie publique',
      'Ephémères, partagés, pédagogiques',
      'Jardinets décoratifs',
      'Jardins d\'Etat',
      'Jardins grandes institutions',
      'Jardins privatifs',
      'Promenades ouvertes'
    ];

    // Filtrer les résultats pour inclure seulement les types spécifiés
    const filteredResults = espacesVerts.filter(item => {
      const type = item.fields.type;
      return allowedTypes.includes(type);
    });

    res.json(filteredResults);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.get('/api/search/fontaines', async (req, res) => {
  try {
    const fontainesResponse = await axios.get(DATASET_URLS.fontaines);
    const fontaines = fontainesResponse.data.records;
    res.json(fontaines);
  } catch (error) {
    console.error('Error fetching fontaines data:', error);
    res.status(500).json({ error: 'Error fetching fontaines data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});