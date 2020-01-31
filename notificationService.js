import { NativeModules } from 'react-native';

const { notificationService } = NativeModules;



export default notificationService;


/*
import notificationService from './notificationService'
    
    //params: key,text,iv
    notificationService.encrypt("1111111111111111111111111111111111111111111111111111111111111111",
    "swag",
    "22222222222222222222222222222222")
    .then(res => console.log(res))
    .catch(e =>{console.log(e)})
    
    //params: key,text,iv
    notificationService.decrypt("1111111111111111111111111111111111111111111111111111111111111111",
    "Ne7jHawro20dRu3VWEbW0A==\n",
    "22222222222222222222222222222222")
    .then(res => console.log(res))
    .catch(e =>{console.log(e)})*/