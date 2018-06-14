import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Expo, { Constants, SQLite } from 'expo';
import { Platform, StyleSheet, ScrollView, TouchableOpacity, Text, View, Animated, TextInput, Image, FlatList, ListVIew, Button } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';
import { API_KEY } from './WeatherAPIKey';
import Weather from './Weather';
import { StackNavigator } from 'react-navigation';

const db = SQLite.openDatabase('db.db');
const db2 = SQLite.openDatabase({name: 'test.db'});

class HomeScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Główna</Text>
        </View>
    );
  }
}

class HomeScreenSecond extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      brand: ".*",
      model: ".*",
      power: ".*",
      color: ".*"
    };
  }

  SampleFunction() {
    this.setState({brand: ".*"});
    this.setState({model: ".*"});
    this.setState({power: ".*"});
    this.setState({color: ".*"});
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>MARKA</Text>
        <TextInput
          style={{height: 40, width: 100}}
          placeholder="Wpisz tekst"
          onChangeText={(text) => this.setState({brand: text})}
        />
        <Text>MODEL</Text>
        <TextInput
          style={{height: 40, width: 100}}
          placeholder="Wpisz tekst"
          onChangeText={(text) => this.setState({model: text})}
        />
        <Text>MOC</Text>
        <TextInput
          style={{height: 40, width: 100}}
          placeholder="Wpisz tekst"
          onChangeText={(text) => this.setState({power: text})}
        />
        <Text>KOLOR</Text>
        <TextInput
          style={{height: 40, width: 100}}
          placeholder="Wpisz tekst"
          onChangeText={(text) => this.setState({color: text})}
        />
        <Button
          onPress={this.SampleFunction.bind(this) } title="Resetuj wartości"
        />
        <Button
          title="Go to Details"
          onPress={() => {this.props.navigation.navigate('Details', {
            brand: this.state.brand,
            model: this.state.model,
            power: this.state.power,
            color: this.state.color,
          });
        }}
        />
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
  return <RootStack />;
}
}





class DetailsScreen extends React.Component {
  state = {
      items: []
    }

    executeSql = async (sql, params = []) => {
      return new Promise((resolve, reject) => db.transaction(tx => {
        tx.executeSql(sql, params, (_, { rows }) => resolve(rows._array), reject)
      }))
    }

    componentWillMount () {
      this.init()
    }


    init = async () => {
      await this.executeSql('create table if not exists locations (latitude text, longitude numeric);');
      this.select()
    }

    _insert = async () => {
      await this.executeSql('insert into locations (latitude, longitude) values (?, ?)', ['moz', -51.938130]);
      await this.executeSql('insert into locations (latitude, longitude) values (?, ?)', ['Marchew', null]);
      await this.executeSql('insert into locations (latitude, longitude) values (?, ?)', ['Pomidor', -51.937695]);
      return true
    }

     select = () => {
      this.executeSql('select * from locations', []).then(items => this.setState({items})  );
    }

    insert = () => {
      this._insert().then(this.select)
    }

    clear = () => {
      this.executeSql('delete from locations').then(this.select);
    }

    render() {
      return (
        <View style={styles.container}>
          <TouchableOpacity style={{padding: 30, backgroundColor: '#fafafa'}} onPress={this.clear}>
            <Text>CLEAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{padding: 30, backgroundColor: '#fafafa'}} onPress={this.insert}>
            <Text>RUN</Text>
          </TouchableOpacity>
          <ScrollView>
            <Text style={styles.paragraph}>
              {JSON.stringify(this.state.items)}
            </Text>
          </ScrollView>
        </View>
      );
    }
}




class DetailsScreenSecond extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      model: '',
      brand: '',
      color: '',
      horsepower: '',
      imagesrc: ''
    };

    const { params } = this.props.navigation.state;

    const id = params ? params.id : null;

    db2.transaction((tx) => {

      tx.executeSql('SELECT * FROM car WHERE Id=?', [id], (tx, results) => {
        var len = results.rows.length;

        for (let i = 0; i < len; i++) {

          var row = results.rows.item(i);

          this.setState({ brand : row.brand});
          this.setState({ model : row.model});
          this.setState({ color : row.color});
          this.setState({ horsepower : row.horsepower});
          this.setState({ imagesrc : row.photosrc});

          array.push(row);

        }
        });
    });
  }

  render() {
    return (
      <View style={styles.continer}>
        <Text>Szczegóły samochodu:</Text>
        <Text>{'Marka ' + this.state.brand}</Text>
        <Text>{'Model ' + this.state.model}</Text>
        <Text>{'Kolor ' + this.state.color}</Text>
        <Text>{'Moc '+ this.state.horsepower}</Text>
        <Image
          style={{width: 400, height: 400}}
          source={{uri: this.state.imagesrc}}
        />
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
              padding: 5,
              backgroundColor: done ? '#aaffaa' : 'white',
              borderColor: 'black',
              borderWidth: 1,
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



const RootStack = StackNavigator(
  {
    Home: {
      screen: HomeScreenSecond,
    },
    Details: {
      screen: DetailsScreen,
    },
    DetailsSecond: {
      screen: DetailsScreenSecond,
    },
  },
  {
    initialRouteName: 'Home',
  }
);




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
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});
