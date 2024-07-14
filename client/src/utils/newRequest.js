import axios from "axios";
import {backEndPort} from '../../../api/settings.js'

const newRequest = axios.create({
  baseURL: `${backEndPort}/api/`,
  withCredentials: true,
});

export default newRequest;
