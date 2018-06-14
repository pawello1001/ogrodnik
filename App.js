import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Expo, { SQLite } from 'expo';
import { StyleSheet, TouchableOpacity, Text, View, Animated, TextInput} from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';
import { API_KEY } from './WeatherAPIKey';
import Weather from './Weather';

const db = SQLite.openDatabase('db.db');

class HomeScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Główna</Text>
        </View>
    );
  }
}

class TodolistScreen extends React.Component {
  state = {
    text: null,
  };

  componentDidMount() {
    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists items (id integer primary key not null, done int, value text);'
      );
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
          }}>
          <TextInput
            style={{
              flex: 1,
              padding: 10,
              height: 80,
              borderColor: 'gray',
              borderWidth: 1,
            }}
            placeholder="Dodaj nowe zadanie"
            value={this.state.text}
            onChangeText={text => this.setState({ text })}
            onSubmitEditing={() => {
              this.add(this.state.text);
              this.setState({ text: null });
            }}
          />
        </View>
        <View style={{ flex: 1, backgroundColor: 'green' }}>
          <Items
            done={false}
            ref={todo => (this.todo = todo)}
            onPressItem={id =>
              db.transaction(
                tx => {
                  tx.executeSql(`update items set done = 1 where id = ?;`, [id]);
                },
                null,
                this.update
              )}
          />
          <Items
            done={true}
            ref={done => (this.done = done)}
            onPressItem={id =>
              db.transaction(
                tx => {
                  tx.executeSql(`delete from items where id = ?;`, [id]);
                },
                null,
                this.update
              )}
          />
        </View>
      </View>
    );
  }

  add(text) {
    db.transaction(
      tx => {
        tx.executeSql('insert into items (done, value) values (0, ?)', [text]);
        tx.executeSql('select * from items', [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null,
      this.update
    );
  }

  update = () => {
    this.todo && this.todo.update();
    this.done && this.done.update();
  };
}

class FruitsScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Baza danych roślin</Text>
      </View>
    );
  }
}

class Items extends React.Component {
  state = {
    items: null,
  };

  componentDidMount() {
    this.update();
  }

  render() {
    const { items } = this.state;
    if (items === null || items.length === 0) {
      return null;
    }

    return (
      <View style={{ margin: 5 }}>
        {items.map(({ id, done, value }) => (
          <TouchableOpacity
            key={id}
            onPress={() => this.props.onPressItem && this.props.onPressItem(id)}
            style={{
              padding: 10,
              backgroundColor: done ? '#aaffaa' : 'white',
              borderColor: 'black',
              borderWidth: 2,
            }}>
            <Text>{value}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  update() {
    db.transaction(tx => {
      tx.executeSql(
        `select * from items where done = ?;`,
        [this.props.done ? 1 : 0],
        (_, { rows: { _array } }) => this.setState({ items: _array })
      );
    });
  }
}

class App extends React.Component {
  state = {
    isLoading: true,
    temperature: 0,
    weatherCondition: null,
    error: null
  };

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      error => {
        this.setState({
          error: 'Error getting weather condtions'
        });
      }
    );
  }

  fetchWeather(lat = 25, lon = 25) {
    fetch(
      `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${API_KEY}&units=metric`
    ).then  (res => res.json())
    .then(json => {
      console.log(json);
      this.setState({
        temperature: json.main.temp,
        weatherCondition: json.weather[0].main,
        isLoading: false
      })
    });
  }

  render() {
    const { isLoading } = this.state;
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {isLoading ? <Text>Pobieranie pogody</Text> :
        <Weather weather={this.state.weatherCondition} temperature={this.state.temperature}/>}
      </View>
    );
  }
}

export default createBottomTabNavigator(
  {
    Start: HomeScreen,
    Rośliny: FruitsScreen,
    Zadania: TodolistScreen,
    Pogoda: App,
  },
{
  navigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, tintColor }) => {
          const { routeName } = navigation.state;
          let iconName;
          if (routeName === 'Start') {
            iconName = `ios-home${focused ? '' : '-outline'}`;
          } else if (routeName === 'Zadania') {
            iconName = `ios-clipboard${focused ? '' : '-outline'}`;
          } else if (routeName === 'Pogoda') {
            iconName = `ios-partly-sunny${focused ? '' : '-outline'}`;
          } else if (routeName === 'Rośliny') {
            iconName = `ios-nutrition${focused ? '' : '-outline'}`;
          }

          // You can return any component that you like here! We usually use an
          // icon component from react-native-vector-icons
          return <Ionicons name={iconName} size={25} color={tintColor} />;
        },
      }),
      tabBarOptions: {
        activeTintColor: 'green',
        inactiveTintColor: 'gray',
      },
}
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingTop: Expo.Constants.statusBarHeight,
  },
});
