import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [actors, setActors] = useState([]);
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const fetchActors = async () => {
      try {
        const response = await axios.get('https://switch-yam-equator.azurewebsites.net/api/actors', {
          headers: {
            'x-chmura-cors': 'c3ed0d1a-98f4-42e8-bff9-956b17323892',
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          console.log('Successful response from API endpoint');
        }

        const movies = response.data;

        const filteredMovies = movies.filter(
          (movie) => movie.actors?.includes('115') && movie.actors?.includes('206')
        );

        const actorIds = filteredMovies.reduce(
          (actorIds, movie) => actorIds.concat(movie.actors.filter((actorId) => actorId !== '115' && actorId !== '206')),
          []
        );

        const uniqueActorIds = [...new Set(actorIds)];

        const actorsResponse = await axios.get(`https://switch-yam-equator.azurewebsites.net/api/actors?ids=${uniqueActorIds.join(',')}`, {
          headers: {
            'x-chmura-cors': 'c3ed0d1a-98f4-42e8-bff9-956b17323892',
            'Content-Type': 'application/json',
          }
        });

        if (actorsResponse.status === 200) {
          console.log('Successful response from API endpoint');
        }

        setActors(actorsResponse.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchActors();
  }, []);


  const validateActorsData = (actorsData) => {
    // Check if actorsData is an array and contains at least one item
    if (!Array.isArray(actorsData) || actorsData.length === 0) {
      return false;
    }

    // Check if each actor in the data has a valid 'id' property
    for (const actor of actorsData) {
      if (!actor || !actor.id || typeof actor.id !== 'string') {
        return false;
      }
    }

    return true;
  };




  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const filteredMovies = actors.filter((movie) => movie.actors?.includes('115') && movie.actors?.includes('206'));

      const results = actors.map((actor) => ({
        Name: actor.name,
        KRMovies: filteredMovies.filter((movie) => movie.actors?.includes('115') && movie.actors?.includes('206'))
          .map((movie) => movie.title),
        NCMovies: filteredMovies.filter((movie) => movie.actors?.includes('115') && !movie.actors?.includes('206'))
          .map((movie) => movie.title)
      }));



      // Validate actors data using the validateActorsData function
      const isActorsDataValid = validateActorsData(results);



      // Update the state based on validation results
      setIsValid(isActorsDataValid);



      // Send actors data to the validation endpoint
      const validationResponse = await axios.post(
        'https://switch-yam-equator.azurewebsites.net/api/validation',
        results,
        {
          headers: {
            'x-chmura-cors': 'c3ed0d1a-98f4-42e8-bff9-956b17323892',
            'Content-Type': 'application/json',
          },
        }
      );

      if (validationResponse.status === 200 && validationResponse.data.isValid) {
        console.log('Successful validation of JSON input');
        // You may perform additional actions here if validation is successful
      } else {
        // Handle validation failure, if required
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Actors in Movies with Nicolas Cage and Keanu Reeves</h1>

      <form onClick={handleSubmit} method='post'>
        <button type="submit">Connected?</button>
      </form> 

      {isValid !== null && (
        <p>{isValid ? 'Validation successful!' : 'Validation failed.'}</p>
      )}
      <ul>
        {actors.map((actor, key) => (
          <li key={key}>{actor.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
