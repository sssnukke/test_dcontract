import {validationResult} from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';

import sheets, { SHEET_ID } from '../sheetClient.js';


export const registration = async(req, res) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const id = uuidv4();
        const doc = ({
            id: id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            gender: req.body.gender,
            address: req.body.address,
            city: req.body.city,
            phone: req.body.phone,
            email: req.body.email,
            password: hash,
            status: req.body.status,
        })

        const rows = Object.values(doc);
        const token = jwt.sign({
                id: rows.id,
            },
            'secret',
            {
                expiresIn: '30d',
            },
        );

        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: 'Лист1!A:I',
            insertDataOption: 'INSERT_ROWS',
            valueInputOption: 'RAW',
            requestBody: {
                values: [rows],
            },
        });

        res.json({
            token,
        });
    } catch (err) {
        return res.status(400).json({
            message: 'Не удалось зарегистрироваться',
            error: err,
        })
    }
};

export const login = async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: "Лист1!A:I",
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "Данные в таблице отсутствуют" });
        }

        const user = rows.find((row) => row[7] === req.body.email);

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        const [id, firstName, lastName, gender, address, city, phone, email, passwordHash] = user;

        const isValidPass = await bcrypt.compare(req.body.password, passwordHash.trim());

        if (!isValidPass) {
            return res.status(403).json({ message: "Неверный логин или пароль" });
        }

        const token = jwt.sign({
                _id: user._id,
            },
            'secret',
            {
                expiresIn: '30d',
            },
        );

        const userData = {
            id,
            firstName,
            lastName,
            gender,
            address,
            city,
            phone,
            email,
        };

        res.json({
            ...userData,
            token
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Не удалось авторизоваться" });
    }
};

export const getAll = async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: "Лист1!A:I",
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "Данные в таблице отсутствуют" });
        }

        const users = rows.slice(1).map((row) => {
            const [id, firstName, lastName, gender, address, city, phone, email, passwordHash] = row;
            return {
                id,
                firstName,
                lastName,
                gender,
                address,
                city,
                phone,
                email,
            };
        });

        res.json(users);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Не удалось получить пользователей" });
    }
};

export const findStatus = async (req, res) => {
    try {
        const status = req.params.status.toUpperCase();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: "Лист1!A:J",
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "Данные в таблице отсутствуют" });
        }

        console.log("Данные из таблицы:", rows);

        const usersWithStatus = rows.filter(row => {
            const rowStatus = row[9] ? row[9].toString().toUpperCase() : "";
            console.log(`Статус пользователя (${row[9]}): ${rowStatus}`);
            return rowStatus === status;
        });

        if (usersWithStatus.length === 0) {
            return res.status(404).json({ message: "Пользователи с таким статусом не найдены" });
        }

        res.json({
            users: usersWithStatus,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Не удалось получить данные" });
    }
};

