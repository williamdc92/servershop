const express = require('express');
const app = express();
const cors = require('cors');
const {
  v4,
  validate
} = require('uuid');
const PORT = process.env.PORT || 5000;
const cool = require('cool-ascii-faces');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config();

let products = require("./json/products.json")
let users = require("./json/users.json")
let keys = require("./json/keys.json")

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());


products.forEach(item => {
  item.id = v4();
});
users.forEach(item => {
  item.id = v4();
});

users.forEach(user => {
  user.orders.id = v4()
})



app.use(cors());

app.get('/', (_, res) => {
  res.status(400).json(message = 'Server is running');
});
app.put('/', (_, res) => {
  res.status(400).json(message = 'invalid request');
});
app.delete('/', (_, res) => {
  res.status(400).json(message = 'invalid request');
});
app.post('/', (_, res) => {
  res.status(400).json(message = 'invalid request');
});


app.put('/products', (_, res) => {
  res.status(400).json(message = 'invalid request, use /products:id');
});
app.delete('/products', (_, res) => {
  res.status(400).json(message = 'invalid request, use /products:id');
});
app.get('/products', (req, res) => {

  //GET PRODUCTS

  let filtered = products;

  if (req.query.producer) {
    filtered = filtered.filter(item => item.producer == req.query.producer)
  }


  if (req.query.category) { // 
    filtered = filtered.filter(item => item.category == req.query.category)
  }

  if (req.query.maxprice) {
    filtered = filtered.filter(item => item.price <= req.query.maxprice)
  }

  res.json(filtered);
});

decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

isExpired = (token) => {
  var isExpiredToken = false;

  var dateNow = new Date();
  var decodedToken = decodeToken(token);

if(decodedToken.exp < dateNow.getTime()/1000)

{
       isExpiredToken = true;
}

return isExpiredToken;
}

// GET PRODUCT BY ID
app.get('/products/:id', (req, res) => {
  const product = products.find(item => item.id === req.params.id);
  if (product == undefined) {
    res.status(404).json(message = 'id of product not found');
  } else res.json(product);
});

// EDIT PRODUCT BY ID
app.put('/products/:id', (req, res) => {
  const productIndex = products.findIndex(item => item.id === req.params.id);
  if (productIndex < 0) {
    res.status(404).json(message = 'id of product not found');
  } else {
    products[productIndex].title = req.body.title;
    products[productIndex].price = req.body.price;
    products[productIndex].description = req.body.description;
    products[productIndex].category = req.body.category;
    products[productIndex].producer = req.body.producer;
    products[productIndex].image = req.body.image;
    res.json(products[productIndex]);
  }
})

// DELETE PRODUCT BY ID

app.delete('/products/:id', (req, res) => {
  const product = products.findIndex(item => item.id === req.params.id);
  if (product < 0) {
    {
      res.status(404).json(message = 'id of product not found')
    }
  } else {
    splice = products.splice(product, 1);
    res.json(splice[0]);
  }

})

//ADD PRODUCT,

app.post('/products', (req, res) => {
  const product = {
    "id": v4(),
    "title": req.body.title,
    "price": req.body.price,
    "description": req.body.description,
    "category": req.body.category,
    "producer": req.body.producer,
    "image": req.body.image,
    "valutations": []
  }

  console.log(product);
  if (product.title == "" | product.price == "" || product.description == "" || product.category == "" || product.producer == "" || product.image == "") {
    res.status(404).json(message = 'fields cannot be empty!')
  } else {
    products.push(product)
    res.json(product)
  };

})

//ADD VALUTATION BY ID

app.post('/products/:id', (req, res) => {

  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else if (!isExpired(req.get('auth'))) {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

      productIndex = products.findIndex(item => item.id === req.params.id);
    if (productIndex < 0) {
      res.status(404).json(message = 'id of product not found');
    } else {

      const valutation = {
        "nickname": req.body.nickname,
        "star": req.body.star,
        "comment": req.body.comment,

      }
      if (valutation.nickname == "") {
        valutation.nickname = "Anonymous"
      };

      if (valutation.star == "" | valutation.comment == "") {
        res.status(404).json(message = 'fields cannot be empty!')
      } else {
        products[productIndex].valutations.push(valutation)
        res.json(products[productIndex])
      };
    }
  }
  else {
    res.status(401).json(message = 'token expired')
  }
})

// ----- USERS ONLY -----

//GET USERS 

app.get('/users', (_, res) => {
  res.json(users);
})

//REGISTER 

app.post('/register', async (req, res) => {
  const user = {
    id: v4(),
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    token: "",
    refreshToken: "",
    address: "",
    isAdmin: false,
    orders: [],
    cart: [],
    favourites: []
  }

  token = (req.get('authorization'));

  const ValidToken = keys.some(key => key === token)

  if (!ValidToken) {
    res.status(404).json(message = 'Invalid token')
  } else

  {

    try {


      if (user.email == "" || user.surname == "" || user.password == "") {
        res.status(404).json(message = 'fields cannot be empty!')
      } else {
        const oldUser = users.find(item => item.email == user.email)
        if (oldUser) {
          return res.status(409).json(message = "User Already exist. Please Log-in")
        }
        if (!oldUser) {
          encryptedPassword = await bcrypt.hash(user.password, 10);
          user.password = encryptedPassword;
          users.push(user)
          res.status(201).json(message = "Successfully registered! You are now a member of DRG STORE, please log in")
        }
      }
    } catch (err) {
      console.log(err)
      res.status(500).json(err);
    };

  }
})

//LOGIN

app.post('/login', async (req, res) => {

  token = (req.get('authorization'));

  const ValidToken = keys.some(key => key === token)

  if (!ValidToken) {
    res.status(404).json(message = 'Invalid token')
  } else

  {



    try {


      if (req.body.email == "" || req.body.password == "") res.status(404).json(message = 'fields cannot be empty!')

      else {
        const userIndex = users.findIndex(item => item.email == req.body.email);
        if (userIndex < 0) {
          res.status(404).json(message = 'User not found. Check your Email or please signin first');
        } else {

          if (await bcrypt.compare(req.body.password, users[userIndex].password)) {
            const token = jwt.sign({
                user_id: users[userIndex].id,
                email: users[userIndex].email,
                isAdmin: users[userIndex].isAdmin
              },
              process.env.JWT_KEY, {
                //expiresIn: "365d"
                expiresIn: "30s"
              }
            );
            const refreshToken = jwt.sign({
                user_id: users[userIndex].id,
                email: users[userIndex].email,
                isAdmin: users[userIndex].isAdmin
              },
              process.env.JWT_RKEY, {
                expiresIn: "60s"
              }
            );

            users[userIndex].token = token;
            users[userIndex].refreshToken = refreshToken;

            const response = {
              "grantType": "bearer",
              "token": users[userIndex].token,
              "refreshToken": users[userIndex].refreshToken,
              "email": users[userIndex].email,
              "id": users[userIndex].id,
              "isAdmin": users[userIndex].isAdmin
            }
            res.status(200).json(response);
          } else res.status(404).json(message = 'Invalid password');
        }

      }
    } catch (err) {
      console.log(err)
      res.status(500).json(err)
    }
  }
})

// REFRESH TOKEN 

app.post('/token', (req, res) => {
  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');
  //Prendo token scaduto dal client 
  else  {
    var analyzedToken = decodeToken(req.get('auth'));
    //analizzo token scaduto e prendo id utente e il suo indice
    const userIndex = users.findIndex(item => item.id === analyzedToken.user_id);
    if (userIndex < 0) {
      res.status(404).json(message = 'id of user not found');
    } else if (users[userIndex].refreshToken && !isExpired(users[userIndex].refreshToken) ) { //se refreshToken esiste e non è scaduto

      users[userIndex].token = users[userIndex].refreshToken; //il token scaduto viene rimpiazzato dal token di refresh

      const refreshToken = jwt.sign({ //genero un altro token di riserva per utilizzo futuro
          user_id: users[userIndex].id,
          email: users[userIndex].email,
          isAdmin: users[userIndex].isAdmin
        },
        process.env.JWT_RKEY, {
          expiresIn: "60s"
        }
      )
      users[userIndex].refreshToken = refreshToken;
      res.json(users[userIndex].refreshToken); //restituisco il nuovo refresh token

    } else { //se anche il refreshToken è scaduto
      res.status(404).json(message = 'no valid token found');
    }

  }

})

//GET ME USER

app.get('/me', function (req, res) {
  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else  {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

      userobj = {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        token: user.token
      }
    res.json(userobj);

  }



})


//FIND USER BY ID

app.get('/users/:id', (req, res) => {
  const user = users.find(item => item.id === req.params.id);
  if (user == undefined) {
    res.status(404).json(message = 'id of user not found');
  } else {
    res.json(user);
  }
});


//EDIT USER BY ID

app.put('/users/:id', (req, res) => {
  const userIndex = users.findIndex(item => item.id === req.params.id);
  if (userIndex < 0) {
    res.status(404).json(message = 'id of user not found');
  } else {
    users[userIndex].name = req.body.name;
    users[userIndex].surname = req.body.surname;
    users[userIndex].address = req.body.address;
    res.json(users[userIndex]);
  }
})

//MAKEADMIN-REMOVEADMIN 

app.put('/users/:id/isadmin', (req, res) => {

  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

    if (user.isAdmin == false) {
      res.status(404).json(message = 'You are not an administrator');
    } else

      userIndex = users.findIndex(item => item.id === req.params.id);
    if (userIndex < 0) {
      res.status(404).json(message = 'id of user not found');
    } else {
      users[userIndex].isAdmin = !users[userIndex].isAdmin;

      res.json(users[userIndex]);
    }
  }
})

//SEE CART BY ID OF USER 

app.get('/users/:id/cart', (req, res) => {

  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

    {

      const userIndex = users.findIndex(item => item.id === req.params.id);
      if (userIndex < 0) {
        res.status(404).json(message = 'id of user not found');
      } else {
        res.json(users[userIndex].cart);
      }
    }
  }
})


//ADD PRODUCT IN CART OF USER BY ID

app.post('/users/:id/cart', (req, res) => {

  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

      userIndex = users.findIndex(item => item.id === req.params.id);
    if (userIndex < 0) {
      res.status(404).json(message = 'id of user not found');
    } else {


      var currentProduct = products.find(product => product.id === req.body.id); //DONE

      const product = {
        "tot": 0,
        "quantity": 1,
        "product": currentProduct
      }

      const isInCart = users[userIndex].cart.some(item => item.product.id == req.body.id);

      if (isInCart) {
        const IndexIsInCart = users[userIndex].cart.findIndex(item => item.product.id === req.body.id);
        users[userIndex].cart[IndexIsInCart].quantity++
        users[userIndex].cart[IndexIsInCart].tot = users[userIndex].cart[IndexIsInCart].quantity * req.body.price;
        res.json(users[userIndex].cart)
      } else {

        product.tot = currentProduct.price;
        users[userIndex].cart.push(product)
        res.json(users[userIndex].cart)
      };


    }
  }
  
})

//Get element of Cart 

app.get('/users/:id/cart/:idp', (req, res) => {

  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

    {
      const userIndex = users.findIndex(item => item.id === req.params.id);
      console.log(userIndex);
      if (userIndex < 0) {
        res.status(404).json(message = 'id of user not found');
      } else {
        const productIndex = users[userIndex].cart.findIndex(product => product.product.id === req.params.idp)
        if (productIndex < 0) {
          res.status(404).json(message = 'id of product not found');
        } else {
          res.json(users[userIndex].cart[productIndex])
        }
      }
    }
  }
  
})

//Remove Product from Cart 

app.delete('/users/:id/cart/:idp', (req, res) => {
  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else   {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

    {
      const userIndex = users.findIndex(item => item.id === req.params.id);
      if (userIndex < 0) {
        res.status(404).json(message = 'id of user not found');
      } else {
        const productIndex = users[userIndex].cart.findIndex(product => product.product.id === req.params.idp)
        if (productIndex < 0) {
          res.status(404).json(message = 'id of product not found');
        } else {
          users[userIndex].cart.splice(productIndex, 1)
          res.json(users[userIndex].cart)
        }
      }
    }
  }
  
})

//INCREASE QUANTITY OF PRODUCT IN CART BY id

app.put('/users/:id/cart/:idp/increase', (req, res) => {

  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

    {
      const userIndex = users.findIndex(item => item.id === req.params.id);
      if (userIndex < 0) {
        res.status(404).json(message = 'id of user not found');
      } else {
        const productIndex = users[userIndex].cart.findIndex(product => product.product.id === req.params.idp)
        if (productIndex < 0) {
          res.status(404).json(message = 'id of product not found');
        } else {
          users[userIndex].cart[productIndex].quantity++
          users[userIndex].cart[productIndex].tot = users[userIndex].cart[productIndex].quantity * users[userIndex].cart[productIndex].product.price
          res.json(users[userIndex].cart[productIndex])
        }
      }
    }
  }
})

//DECREASE QUANTITY OF PRODUCT IN CART BY id

app.put('/users/:id/cart/:idp/decrease', (req, res) => {

  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

    {
      const userIndex = users.findIndex(item => item.id === req.params.id);
      if (userIndex < 0) {
        res.status(404).json(message = 'id of user not found');
      } else {
        const productIndex = users[userIndex].cart.findIndex(product => product.product.id === req.params.idp)
        if (productIndex < 0) {
          res.status(404).json(message = 'id of product not found');
        } else {
          users[userIndex].cart[productIndex].quantity--
          if (users[userIndex].cart[productIndex].quantity == 0) {
            users[userIndex].cart.splice(productIndex, 1)
            res.json(message = 'Item removed')
          } else {
            users[userIndex].cart[productIndex].tot = users[userIndex].cart[productIndex].quantity * users[userIndex].cart[productIndex].product.price
            res.json(users[userIndex].cart[productIndex])
          }

        }
      }
    }
  }
})


//GET FAVOURITES BY ID OF USER 

app.get('/users/:id/favourites', (req, res) => {

  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

    {

      const userIndex = users.findIndex(item => item.id === req.params.id);
      if (userIndex < 0) {
        res.status(404).json(message = 'id of user not found');
      } else {
        res.json(users[userIndex].favourites);
      }
    }
  }
})



//ADD PRODUCT IN FAVOURITES OF USER BY ID

app.post('/users/:id/favourites', (req, res) => {
  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

    {
      const userIndex = users.findIndex(item => item.id === req.params.id);
      if (userIndex < 0) {
        res.status(404).json(message = 'id of user not found');
      } else {


        const currentProduct = products.find(item => item.id === req.body.id);



        if (req.body.id == "") {
          res.status(404).json(message = 'no id of product provided!')
        } else {
          users[userIndex].favourites.push(currentProduct);
          res.json(users[userIndex].favourites)
        };
      }
    }
  }
})

//REMOVE FROM FAVOURITES 

app.delete('/users/:id/favourites/:idp', (req, res) => {

  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

    {

      const userIndex = users.findIndex(item => item.id === req.params.id);
      if (userIndex < 0) {
        res.status(404).json(message = 'id of user not found');
      } else {

        const productIndex = users[userIndex].favourites.findIndex(product => product.id == req.params.idp)
        if (productIndex < 0) {
          res.status(404).json(message = 'id of product not found');
        } else {
          users[userIndex].favourites.splice(productIndex, 1);
          res.json(users[userIndex].favourites);
        }
      }
    }
  }
})

//ADD ORDER OF USER BY ID

app.post('/users/:id/orders', (req, res) => {
  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

    {


      const userIndex = users.findIndex(item => item.id === req.params.id);
      if (userIndex < 0) {
        res.status(404).json(message = 'id of user not found');
      } else {

        var items = users[userIndex].cart;
        var total = users[userIndex].cart.map(item => item.tot).reduce((sum, item) => sum + item, 0);

        const order = {
          "date": new Date,
          "items": items,
          "total": total,
          "id": v4()
        }


        users[userIndex].orders.push(order)
        users[userIndex].cart = [];
        res.json(users[userIndex].orders)

      }
    }
  }
})

//GET ORDERS OF USER BY ID

app.get('/users/:id/orders', (req, res) => {

  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

    {

      const userIndex = users.findIndex(item => item.id === req.params.id);
      if (userIndex < 0) {
        res.status(404).json(message = 'id of user not found');
      } else {
        res.json(users[userIndex].orders);
      }
    }
  }
})

//GET SINGLE ORDER OF USER BY ID OF ORDER 

app.get('/users/:id/orders/:ido', (req, res) => {

  if (req.get('auth') == undefined) res.status(404).json(message = 'Token not provided.');

  else {
    const user = users.find(user => user.token === (req.get('auth')));

    if (user == undefined) {
      res.status(404).json(message = 'invalid token');
    } else

    {

      const userIndex = users.findIndex(item => item.id === req.params.id);
      if (userIndex < 0) {
        res.status(404).json(message = 'id of user not found');
      } else {

        const orderIndex = users[userIndex].orders.findIndex(order => order.id == req.params.ido)
        if (orderIndex < 0) {
          res.status(404).json(message = 'id of order not found');
        } else {
          res.json(users[userIndex].orders[orderIndex]);
        }
      }
    }
  }

})


app.listen(PORT, () => console.log(`Listening on ${ PORT }`))