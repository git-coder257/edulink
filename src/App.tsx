import axios from 'axios';
import { FC, useState, useEffect } from 'react';
import './App.css';

const handlelogin = async (params: any) => {
  
  // axios.post("https://dry-shore-19751.herokuapp.com/edulinkapi/login/false")

  let type = "Login"
  
  const headers = {
    'X-API-Method': `EduLink.${type}`,
    'Content-Type': 'application/json'
  }
  
  const response = await fetch(`https://www.edulinkone.com/api/?method=EduLink.${type}`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: `EduLink.${type}`,
      uuid: '998c5f12-1a9a-4aa4-a59a-f7cfff8d6638',
      // uuid: "aaa",
      id: '1',
      params: params
    })
  })

  const data = await response.json()
  
  if (data.result.error) {
    console.log(data.result.error)
    alert(`Error from EduLink API: ${data.result.error}`)
    return false
  } else {
    return data.result
  }
}

const handletimetable = async (params: any, authToken: string) => {
  try {
    let type = "Timetable"
    //"Access-Control-Allow-Headers": "Content-Type, X-API-Method, Authorization",
    const headers = {
      'X-API-Method': `EduLink.${type}`,
      'Content-Type': 'application/json;charset=UTF-8',
      "Authorization": `Bearer ${authToken}`,
      "Origin": "https://www.edulinkone.com"
    }
  
    console.log(params)
    
    const response = await fetch("https://www.edulinkone.com/api/?method=EduLink.Timetable", {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: `EduLink.${type}`,
        uuid: 'fc112e05-2944-42bc-b8ab-b63265f190e0',
        // uuid: "aaa",
        id: '1',
        params: params
      })
    })
  
    const data = await response.json()
    
    if (data.result.error) {
      console.log(data.result.error)
      alert(`Error from EduLink API: ${data.result.error}`)
      return false
    } else {
      return data.result
    }
  } catch (error) {
    console.error(error)
  }
}

interface timetable {
  name: string,
  is_current: boolean,
  days: {
    cycle_day_id: string,
    date: string,
    name: string,
    original_name: string,
    periods: {
      id: string,
      external_id: string,
      name: string,
      start_time: string,
      end_time: string,
      empty: boolean
    }[],
    lessons: {
      period_id: string,
      room: {
        name: string,
        id: string,
        moved: boolean
      },
      teachers: string,
      teacher: {
        id: string, 
        title: string,
        forename: string,
        surname: string
      },
      teaching_group: {
        id: string,
        name: string,
        subject: string
      }
    }[]
  }[]
}

//self.crypto ? self.crypto.randomUUID() :

const App: FC = () => {

  let [email, setemail] = useState("21otingay@ivc.tmet.org.uk")
  let [password, setpassword] = useState("elevenmike2")
  let [schoolId, setschoolId] = useState<number>(61)
  let [logedin, setlogedin] = useState(false)
  let [authToken, setauthToken] = useState("")
  let [learner_id, setlearner_id] = useState("")
  let [timetableshown, settimetableshown] = useState(false)
  let [currenttimetable, setcurrenttimetable] = useState<timetable>()
  let [timetable, settimetable] = useState([])
  let [timetableweeks, settimetableweeks] = useState([])
  
  const handleconfirmlogin = () => {
    (async () => {
      const data: {success: boolean, authtoken: string, user: {id: string}} = await handlelogin({
        from_app: false,
        username: email,
        password: password,
        establishment_id: schoolId
      })

      if (data.success){
        setlogedin(true)
        setauthToken(data.authtoken)
        // learner_id = data.user.id
        setlearner_id(data.user.id)
        console.log(data.user)
      } else {
        console.log(data)
      }
    })()
  }

  const handleshowtimetable = () => {
   (async () => {
      const data: {success: boolean, weeks: {
          name: string,
          is_current: boolean,
          days: {
            cycle_day_id: string,
            date: string,
            name: string,
            original_name: string,
            periods: {
              id: string,
              external_id: string,
              name: string,
              start_time: string,
              end_time: string,
              empty: boolean
            }[],
            lessons: {
              period_id: string,
              room: {
                name: string,
                id: string,
                moved: boolean
              },
              teachers: string,
              teacher: {
                id: string, 
                title: string,
                forename: string,
                surname: string
              },
              teaching_group: {
                id: string,
                name: string,
                subject: string
              }
            }[]
      }[]}[]} = await handletimetable({
        date: "2022-06-21",
        learner_id: learner_id
      }, authToken)

     if (data.success){
      settimetable(data.weeks)
      setcurrenttimetable(data.weeks[0])
     }

     console.log(data)
   })()
  }

  return (
    <div className="App">
      {!logedin ? <>
        <input placeholder='email' onChange={(e) => {
          setemail(e.target.value)
        }}/>
        <input placeholder='password' onChange={(e) => {
          setpassword(e.target.value)
        }}/>
        <input placeholder='school id' onChange={(e) => {
          setschoolId(parseInt(e.target.value))
        }}/>
        <button onClick={handleconfirmlogin}>Login</button>
      </> : <>
        {!timetableshown ? <button onClick={handleshowtimetable}>
          Show Timetable
        </button> : <>
          {currenttimetable.days.map(day => {
          console.log(day)
          return day.lessons.map(lesson => {
            return <div>{lesson.teaching_group.subject}</div>
          })
        </>}
      </>}
    </div>
  );
}
//21otingay@ivc.tmet.org.uk
export default App;
