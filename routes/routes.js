import userRoute from './userRoute.js';


const routes = [
    { path: '/api/v1/user', handler: userRoute },
];

const setRoute = (app) => {
    routes.forEach(({ path, handler }) => app.use(path, handler));
};
export default setRoute;