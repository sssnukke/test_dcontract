import jwt from 'jsonwebtoken';

export default async (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_TOKEN);

            req.userId = decoded.id;
            next();
        }
        catch (e) {
            console.log(e);
            return res.status(401).json({
                message: 'Нет доступа'
            });
        }
    } else {
        return res.status(401).json({
            message: 'Нет доступа'
        });
    }
}