import axios from "axios";
import {backEndPort} from '../../../config.js'

const newRequest = axios.create({
  baseURL: `${backEndPort}/api/`,
  withCredentials: true,
});

export default newRequest;
