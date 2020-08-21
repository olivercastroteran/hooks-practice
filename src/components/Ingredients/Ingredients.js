import React, { useCallback, useReducer } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter((ing) => ing.id !== action.id);
    default:
      throw new Error('Should not get there!');
  }
};

const httpReducer = (curhttpState, action) => {
  switch (action.type) {
    case 'SEND':
      return { loading: true, error: null };
    case 'RESPONSE':
      return { ...curhttpState, loading: false };
    case 'ERROR':
      return { loading: false, error: action.errorMessage };
    case 'CLEAR':
      return { ...curhttpState, error: null };
    default:
      throw new Error('Should not get there!');
  }
};

const Ingredients = () => {
  const [ingredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null,
  });
  //const [ingredients, setIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  // useEffect(() => {
  //   fetch('https://hooks-644ce.firebaseio.com/ingredients.json')
  //     .then((response) => response.json())
  //     .then((data) => {
  //       const loadedIngredients = [];
  //       for (const key in data) {
  //         loadedIngredients.push({
  //           id: key,
  //           title: data[key].title,
  //           amount: data[key].amount,
  //         });
  //       }
  //       setIngredients(loadedIngredients);
  //     });
  // }, []);

  const addIngredientHandler = (ingredient) => {
    //setIsLoading(true);
    dispatchHttp({ type: 'SEND' });
    fetch('https://hooks-644ce.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        //setIsLoading(false);
        dispatchHttp({ type: 'RESPONSE' });
        return response.json();
      })
      .then((data) => {
        // setIngredients((prevIngredients) => [
        //   ...prevIngredients,
        //   { id: data.name, ...ingredient },
        // ]);
        dispatch({ type: 'ADD', ingredient: { id: data.name, ...ingredient } });
      })
      .catch((error) => {
        // setError('Something went wrong!');
        // setIsLoading(false);
        dispatchHttp({ type: 'ERROR', errorMessage: 'Something went wrong!' });
      });
  };

  const removeIngredientHandler = (id) => {
    //setIsLoading(true);
    dispatchHttp({ type: 'SEND' });
    fetch(`https://hooks-644ce.firebaseio.com/ingredients/${id}.json`, {
      method: 'DELETE',
    })
      .then((response) => {
        //setIsLoading(false);
        dispatchHttp({ type: 'RESPONSE' });
        // setIngredients((prevIngredients) =>
        //   prevIngredients.filter((ingredient) => ingredient.id !== id)
        // );
        dispatch({ type: 'DELETE', id: id });
      })
      .catch((error) => {
        // setError('Something went wrong!');
        // setIsLoading(false);
        dispatchHttp({ type: 'ERROR', errorMessage: 'Something went wrong!' });
      });
  };

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    //setIngredients(filteredIngredients);
    dispatch({ type: 'SET', ingredients: filteredIngredients });
  }, []);

  const clearError = () => {
    //setError(null);
    dispatchHttp({ type: 'CLEAR' });
  };

  return (
    <div className="App">
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        isLoading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList
          ingredients={ingredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
