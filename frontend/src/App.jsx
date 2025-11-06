import {Routes,Route} from 'react-router-dom'
import Nav from './Components/Nav'
import Home from './Components/Home'
import List from './Components/List'
import Chatbot from './Components/Chatbot'
export default function App(){
  return(
    <>
    <Nav className="border-b-4 border-indigo-500"/>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path="/list" element={<List/>}/>
      <Route path="/chatbot" element={<Chatbot/>}/>
    </Routes>
    </>
  );
}