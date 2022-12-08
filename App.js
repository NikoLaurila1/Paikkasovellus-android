import React, { useState, useEffect } from 'react';
import { ScrollView, TextInput, } from 'react-native';
import { Appbar, Button, Dialog, FAB, List, Portal, Provider as PaperProvider, Text, Title } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';


const db = SQLite.openDatabase("sijainnit.db");

db.transaction(
  (tx) => {
    tx.executeSql(`CREATE TABLE IF NOT EXISTS Paikka (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    teksti TEXT,
                    ohjeistus TEXT
                  )`);
  }, 
  (err) => {
    console.log(err);    
  }
);


export default function App() {

 
  const [Paikka, setPaikka] = useState([]);
  const [uusiOstosDialogi, setUusiOstosDialogi] = useState({
                                                              nayta : false,
                                                              uusiOstos : "",
                                                              uusiOhjeistus: ""
                                                           });
                                                           

  const tyhjennaLista = () => {

    db.transaction(
      (tx) => {
        tx.executeSql(`DELETE FROM Paikka`, [], 
          (_tx, rs) => {
            haePaikka();
          }
        );
      }, 
      (err) => {
        console.log(err);
      }
    );    

  }

  const lisaaOstos = () => {

    db.transaction(
      (tx) => {
        tx.executeSql(`INSERT INTO Paikka (teksti, ohjeistus) VALUES (?, ?) `, [uusiOstosDialogi.uusiOstos, uusiOstosDialogi.uusiOhjeistus], 
          (_tx, rs) => {
            haePaikka();
          }
        );
      }, 
      (err) => {
        console.log(err);
      }
    );    

    setUusiOstosDialogi({nayta : false, uusiOstos : "", uusiOhjeistus : ""});
   

  }

  

  

  const haePaikka = () => {

    db.transaction(
      (tx) => {
        tx.executeSql(`SELECT * FROM Paikka`, [], 
          (_tx, rs) => {
            setPaikka(rs.rows._array);
          }
        );
      }, 
      (err) => {
        console.log(err);
      }
    );

  }

  useEffect(() => {
    
    haePaikka();
  }, [])

  return (
    <PaperProvider>
      <Appbar.Header>
        <Appbar.Content title="Paikka pro"/>
      </Appbar.Header>
      <ScrollView style={{padding : 20}}>

        <Title>Sijainnit</Title>

        {(Paikka.length > 0)
        ? Paikka.map((ostos) => {
          return <List.Item
                    key={ostos.id}
                    title={ostos.teksti}
                    description={ostos.ohjeistus}

                 />
        })
        : <Text>Ei merkittyjä sijainteja</Text>
        }

     

        <Button
          icon="delete"
          color="red"
          mode="contained"
          style={{ marginTop : 10 }}
          onPress={tyhjennaLista}
        >
          Tyhjennä lista
        </Button>

        <Portal>
          <Dialog visible={uusiOstosDialogi.nayta} onDismiss={ () => { setUusiOstosDialogi({ nayta : false,  uusiOstos : ""}) } }>
            <Dialog.Title>Lisää Paikka</Dialog.Title>
            <Dialog.Content>
              <TextInput 
                label="Ostos"
                mode="outlined"
                placeholder="Kirjoita Tunnisteteksti"
                onChangeText={ (teksti) => { setUusiOstosDialogi({...uusiOstosDialogi, uusiOstos : teksti}) } }
              />

<TextInput 
                label="Ostos"
                mode="outlined"
                placeholder="Kirjoita Ohjeistusteksti"
                onChangeText={ (ohjeistus) => { setUusiOstosDialogi({...uusiOstosDialogi, uusiOhjeistus : ohjeistus}) } }
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button 
                onPress={lisaaOstos}
              >Lisää listaan</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

      </ScrollView>

      <FAB
          icon="plus"
          mode="contained"
          style={{ marginTop : 10 }}
          
          onPress={() => { setUusiOstosDialogi({nayta : true, uusiOstos : ""}) }}
        >
          
        </FAB>
    </PaperProvider>
  );
}

