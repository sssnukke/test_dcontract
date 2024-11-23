import express from 'express';

import { UserController } from "./controllers/index.js";
import {loginValidation, registrationValidation} from "./validations.js";
import {checkAuth, handleValidationErrors} from "./utils/index.js";


const app = express();


app.use(express.json());

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/registration', registrationValidation, handleValidationErrors, UserController.registration);

app.get('/clients', UserController.getAll);
app.post('/clients/:status', handleValidationErrors, UserController.findStatus);

app.listen(3000, (err) => {
    if(err) {
        return console.log(err);
    }

    console.log(`Server started on port 3000!`)
});
