import React, {useEffect, useState} from 'react';
import _ from 'lodash';

import './index.css'

const App = () => {
    const [collections, setCollections] = useState([]);
    const [selects, setSelects] = useState(JSON.parse(localStorage.getItem('select') as string)??[]);
    const [folder, setFolder] = useState('dump');
    const [stateA, setStateA] = useState(JSON.parse(localStorage.getItem('stateA') as string)??{
        MONGODB_HOST:'',
        MONGODB_PORT:'',
        MONGODB_USER:'',
        MONGODB_PASS:'',
        MONGODB_DB_AUTH:'',
        MONGODB_DB:'',
    });
    const [stateB, setStateB] = useState(
        JSON.parse(localStorage.getItem('stateB') as string)??{
        MONGODB_HOST:'',
        MONGODB_PORT:'',
        MONGODB_USER:'',
        MONGODB_PASS:'',
        MONGODB_DB_AUTH:'',
        MONGODB_DB:'',
    });

    const onDump = async () => {
        if (!stateA.MONGODB_HOST||stateA.MONGODB_PORT||stateA.MONGODB_USER||stateA.MONGODB_PASS||stateA.MONGODB_DB_AUTH||stateA.MONGODB_DB) {
            return;
        }

        const dateString = new Date().toISOString().replace(/[:.]/g, '-');
        console.debug(`dateString => `, dateString);
        setFolder(dateString)

        const res = await fetch('http://localhost:4000/api/dump', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({...stateA,folder:dateString,selects})
        });
        console.debug(`res => `, res);
        if (localStorage){
            localStorage.setItem('stateA', JSON.stringify(stateA));
            localStorage.setItem('stateB', JSON.stringify(stateB));
        }

    }
    const onRestore = async () => {
        const res = await fetch('http://localhost:4000/api/restore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({...stateB,folder:folder+'/'+stateA.MONGODB_DB})
        });
        console.debug(`res => `, res);
        if (localStorage){
            localStorage.setItem('stateA', JSON.stringify(stateA));
            localStorage.setItem('stateB', JSON.stringify(stateB));
        }
    }


    const getAllCollections = async (state: any) => {
        const res = await fetch('http://localhost:4000/api/all-collections', {
            body:JSON.stringify({...state,folder})
            , method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            }
        })

        const json = await res.json();
        setCollections((json.data ?? []).sort((a: string, b: string) => a.localeCompare(b)));

    }



    // @ts-ignore
    useEffect( async () => {
        await getAllCollections(stateA)
    }, [stateA]);



    return(<div className={'w-screen h-screen flex flex-col'}>
    <div className={'w-full h-fit flex flex-row p-2 border border-solid border-black gap-1'}>
      <div className={'flex flex-col items-start w-1/2 h-full p-2 gap-0.5  border border-solid border-black rounded-lg'}>
          <p>Host A</p>
          <hr/>
          Host
          <input name={'MONGODB_HOST'} className={'w-full h-full border border-solid border-black rounded-lg p-1'} placeholder={'Host'} onChange={(e) => setStateA({...stateA, [e.target.name]: e.target.value})} value={stateA.MONGODB_HOST}/>
          Port
          <input name={'MONGODB_PORT'}className={'w-full h-full border border-solid border-black rounded-lg p-1'} placeholder={'Port'} onChange={(e) => setStateA({...stateA, [e.target.name]: e.target.value})} value={stateA.MONGODB_PORT}/>
          User
          <input name={'MONGODB_USER'}className={'w-full h-full border border-solid border-black rounded-lg p-1'} placeholder={'User'} onChange={(e) => setStateA({...stateA, [e.target.name]: e.target.value})} value={stateA.MONGODB_USER}/>
          Pass
          <input name={'MONGODB_PASS'}className={'w-full h-full border border-solid border-black rounded-lg p-1'} placeholder={'Pass'} onChange={(e) => setStateA({...stateA, [e.target.name]: e.target.value})} value={stateA.MONGODB_PASS}/>
          DB Auth
          <input name={'MONGODB_DB_AUTH'}className={'w-full h-full border border-solid border-black rounded-lg p-1'} placeholder={'DB Auth'} onChange={(e) => setStateA({...stateA, [e.target.name]: e.target.value})} value={stateA.MONGODB_DB_AUTH} />
          DB
          <input name={'MONGODB_DB'}className={'w-full h-full border border-solid border-black rounded-lg p-1'} placeholder={'DB'} onChange={(e) => setStateA({...stateA, [e.target.name]: e.target.value})} value={stateA.MONGODB_DB}/>
      </div>
        <div className={'flex flex-col items-start w-1/2 h-full p-2 gap-0.5  border border-solid border-black rounded-lg'}>
            <p>Host B</p>
            <hr/>
            Host
            <input name={'MONGODB_HOST'} className={'w-full h-full border border-solid border-black rounded-lg p-1'} placeholder={'Host'} onChange={(e) => setStateB({...stateB, [e.target.name]: e.target.value})} value={stateB.MONGODB_HOST}/>
            Port
            <input name={'MONGODB_PORT'}className={'w-full h-full border border-solid border-black rounded-lg p-1'} placeholder={'Port'} onChange={(e) => setStateB({...stateB, [e.target.name]: e.target.value})} value={stateB.MONGODB_PORT}/>
            User
            <input name={'MONGODB_USER'}className={'w-full h-full border border-solid border-black rounded-lg p-1'} placeholder={'User'} onChange={(e) => setStateB({...stateB, [e.target.name]: e.target.value})} value={stateB.MONGODB_USER}/>
            Pass
            <input name={'MONGODB_PASS'}className={'w-full h-full border border-solid border-black rounded-lg p-1'} placeholder={'Pass'} onChange={(e) => setStateB({...stateB, [e.target.name]: e.target.value})} value={stateB.MONGODB_PASS}/>
            DB Auth
            <input name={'MONGODB_DB_AUTH'}className={'w-full h-full border border-solid border-black rounded-lg p-1'} placeholder={'DB Auth'} onChange={(e) => setStateB({...stateB, [e.target.name]: e.target.value})} value={stateB.MONGODB_DB_AUTH} />
            DB
            <input name={'MONGODB_DB'}className={'w-full h-full border border-solid border-black rounded-lg p-1'} placeholder={'DB'} onChange={(e) => setStateB({...stateB, [e.target.name]: e.target.value})} value={stateB.MONGODB_DB}/>
        </div>
    </div>
        <div className={'flex flex-row items-start gap-1 p-1'}>
            Folder : {folder.toString()}

        </div>
        <div className={'flex flex-row gap-1 p-1'}>
            <button onClick={onDump} className={'cursor-pointer bg-green-500 text-white p-1 rounded-lg hover:bg-green-600 transition-colors duration-300'}>
                Dump
            </button>
            <button onClick={onRestore} className={'cursor-pointer bg-blue-500 text-white p-1 rounded-lg hover:bg-blue-600 transition-colors duration-300'}>
                Restore
            </button>

            <button onClick={()=>{
                setSelects(_.sortedUniq(collections));
                localStorage.setItem('select', JSON.stringify(_.sortedUniq(collections)));
            }} className={'cursor-pointer bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 transition-colors duration-300'}>
                Select All
            </button>
            <button onClick={()=>{
                setSelects([]);
                localStorage.setItem('select', JSON.stringify([]));
            }} className={'cursor-pointer bg-orange-500 text-white p-1 rounded-lg hover:bg-orange-600 transition-colors duration-300'}>
                Deselect All
            </button>

        </div>
      <div className={'w-full h-full flex flex-row flex-wrap  gap-1 p-1'}>
          {
              collections.map((col, index) => (
                    <div key={index} className={`cursor-pointer w-fit h-fit p-1 border border-solid border-black rounded-lg ${selects.includes(col)?'bg-green-500':'bg-white'}`} onClick={()=>{
                        if (selects.includes(col)) {
                            setSelects(selects.filter((item:string) => item !== col));
                            localStorage.setItem('select', JSON.stringify(selects.filter((item:string) => item !== col)));
                        } else {
                            setSelects([...selects, col]);
                            localStorage.setItem('select', JSON.stringify([...selects, col]));
                        }
                    }}>
                        {col}
                    </div>
                ))
          }
      </div>
  </div>);
};
export default App;
