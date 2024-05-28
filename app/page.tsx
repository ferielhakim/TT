'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Grid, TextField, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, MenuItem, Select, FormControl, InputLabel, TablePagination } from '@mui/material';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  usage: string;
  price: number;
  availability: string;
  type: string;
  open247: string;
}

const equipmentTypes = [
  'Baignade extérieure',
  'Bains-douches',
  'Bibliothèque',
  'Brumisateur',
  'Découverte et Initiation',
  'Lieux de culte',
  'Mairie d\'arrondissement',
  'Musée',
  'Ombrière pérenne',
  'Ombrière temporaire',
  'Piscine',
  'Terrain de boules'
];

const spaceTypes = [
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

const fontainTypes = [
  'BORNE_FONTAINE',
  'FONTAINE_2EN1',
  'FONTAINE_ALBIEN',
  'FONTAINE_ARCEAU',
  'FONTAINE_BOIS',
  'FONTAINE_TOTEM',
  'FONTNE_WALLACE',
  'FTNE_MILLENAIRE',
  'FTNE_PETILLANTE',
  'FTNE_POING_EAU'
];
const payantTypes = [
  'Oui',
  'Non'];
const App: React.FC = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState({
    type: '',
    open247: '',
    fontainType: '',
    globalSearch: '',
    currentDataset: 'espacesVerts',
    payant: ''
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData(filters.currentDataset);
  }, [filters.currentDataset]);

  const fetchData = (dataset: string) => {
    let apiUrl = '';
    switch (dataset) {
      case 'espacesVerts':
        apiUrl = 'https://parisdata.opendatasoft.com/api/records/1.0/search/?dataset=ilots-de-fraicheur-espaces-verts-frais&rows=1000';
        break;
      case 'fontaines':
        apiUrl = 'https://parisdata.opendatasoft.com/api/records/1.0/search/?dataset=fontaines-a-boire&rows=1000';
        break;
      case 'equipements':
        apiUrl = 'https://parisdata.opendatasoft.com/api/records/1.0/search/?dataset=ilots-de-fraicheur-equipements-activites&rows=1000';
        break;
      default:
        break;
    }

    axios.get(apiUrl)
      .then(response => {
        const combinedResults: SearchResult[] = response.data.records.map((item: any, index: number) => ({
          id: index.toString(),
          name: item.fields.nom || item.fields.libelle,
          address: `${item.fields['N° Voie Pair'] || ''} ${item.fields['N° Voie Impair'] || ''} ${item.fields.voie || item.fields.adresse_postale || ''}`.trim(),
          usage: item.fields.type_objet || item.fields.type || '',
          price: item.fields.payant === 'Oui' ? 1 : 0,
          availability: item.fields.disponibilite || item.fields.statut_ouverture || item.fields.horaires_periode || '',
          type: item.fields.type,
          open247: item.fields.statut_ouverture === '24/24' ? 'Oui' : 'Non'
        }));
        setAllResults(combinedResults);
        setResults(combinedResults);
        setCurrentPage(0); // Reset page to 0 whenever new data is fetched
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des données:', error);
      });
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<{ name?: string; value: unknown; }>) => {
    const { name, value } = event.target as HTMLInputElement;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    const globalSearchLower = filters.globalSearch.toLowerCase();
    const newFilteredResults = allResults.filter(result => {
      return (
        (!filters.type || (result.type && result.type.includes(filters.type))) &&
        (!filters.equipmentType || result.type === filters.equipmentType) &&
//        ((!filters.fontainType || result.type === filters.fontainType)  
//      (filters.fontainType && result.usage === filters.fontainType)&&
        (!filters.fontainType || result.usage === filters.fontainType)&&
        (!filters.open247 || result.open247 === filters.open247) &&
        (!filters.payant || 
          (filters.payant === 'Oui' && result.price === 1) ||
          (filters.payant === 'Non' && result.price === 0)) &&
        (globalSearchLower === '' ||
          (result.name && result.name.toLowerCase().includes(globalSearchLower)) ||
          (result.address && result.address.toLowerCase().includes(globalSearchLower)) ||
          (result.usage && result.usage.toLowerCase().includes(globalSearchLower)) ||
          (result.availability && result.availability.toLowerCase().includes(globalSearchLower)) ||
          (result.type && result.type.toLowerCase().includes(globalSearchLower)))
      );
    });
    setResults(newFilteredResults);
    setCurrentPage(0); // Reset page to 0 whenever a new search is performed
  };
  

  const handleDatasetToggle = (dataset: string) => {
    setFilters({ ...filters, currentDataset: dataset });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const paginatedResults = results.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

  return (
    <Container style={{ backgroundColor: '#F5F5F5', color: '#000' }}>
      <Typography variant="h1" align="center" style={{ fontFamily: 'Nexa', color: '#5f259f' }}>
        Trouver un endroit frais
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            name="globalSearch"
            label="Recherche générale"
            variant="outlined"
            fullWidth
            value={filters.globalSearch}
            onChange={handleFilterChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          {filters.currentDataset !== 'fontaines' && ( // Changement : Afficher le filtre de type uniquement pour les datasets autres que fontaines
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                label="Type"
              >
                <MenuItem value=""><em>Aucun</em></MenuItem>
                {filters.currentDataset === 'equipements' ? (
                  equipmentTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))
                ) : (
                  spaceTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}
          {filters.currentDataset === 'equipements' && (
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Payant</InputLabel>
              <Select
                name="payant"
                value={filters.payant}
                onChange={handleFilterChange}
                label="Payant"
              >
                <MenuItem value=""><em>Tous</em></MenuItem>
                {payantTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {filters.currentDataset === 'fontaines' && (
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Type de Fontaine</InputLabel>
              <Select
                name="fontainType"
                value={filters.fontainType}
                onChange={handleFilterChange}
                label="Type de Fontaine"
              >
                <MenuItem value=""><em>Aucun</em></MenuItem>
                {fontainTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {filters.currentDataset === 'espacesVerts' && (
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>OUVERTURE 24-24H</InputLabel>
              <Select
                name="open247"
                value={filters.open247}
                onChange={handleFilterChange}
                label="OUVERTURE 24-24H"
              >
                <MenuItem value=""><em>Aucun</em></MenuItem>
                <MenuItem value="Oui">Oui</MenuItem>
                <MenuItem value="Non">Non</MenuItem>
              </Select>
            </FormControl>
          )}
          <Button variant="contained" color="primary" fullWidth onClick={handleSearch}>Rechercher</Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button onClick={() => handleDatasetToggle('espacesVerts')}>Afficher les espaces verts</Button>
          <Button onClick={() => handleDatasetToggle('equipements')}>Afficher les équipements et activités</Button>
          <Button onClick={() => handleDatasetToggle('fontaines')}>Afficher les fontaines à boire</Button>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Adresse</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Payant (O/N)</TableCell>
                  <TableCell>Disponibilité</TableCell>
                  <TableCell>OUVERTURE 24-24H</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedResults.map(result => (
                  <TableRow key={result.id}>
                    <TableCell>{result.name}</TableCell>
                    <TableCell>{result.address}</TableCell>
                    <TableCell>{result.usage}</TableCell>
                    <TableCell>{result.price}</TableCell>
                    <TableCell>{result.availability}</TableCell>
                    <TableCell>{result.open247}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={results.length}
            rowsPerPage={rowsPerPage}
            page={currentPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;
