import ScheduleModel from './ScheduleModel'
export const routes = (app, io) => {
    app.post('/', (req, res) => {
        console.log(req.body)
        // io.emit('new_name', req.body.name);
        return res.status(201).send(req.body);
    });
};