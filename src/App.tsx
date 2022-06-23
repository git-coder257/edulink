import { FC, useState } from 'react';
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
      uuid: generateUUID(),
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
      "Authorization": `Bearer ${authToken}`
    }
  
    console.log(params)
    
    const response = await fetch("https://www.edulinkone.com/api/?method=EduLink.Timetable", {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: `EduLink.${type}`,
        uuid: generateUUID(),
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

function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if(d > 0){//Use timestamp until depleted
          r = (d + r)%16 | 0;
          d = Math.floor(d/16);
      } else {//Use microseconds since page-load if supported
          r = (d2 + r)%16 | 0;
          d2 = Math.floor(d2/16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
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

  let [email, setemail] = useState("")
  let [password, setpassword] = useState("")
  let [schoolId, setschoolId] = useState<number>(61)
  let [logedin, setlogedin] = useState(false)
  let [authToken, setauthToken] = useState("")
  let [learner_id, setlearner_id] = useState("")
  let [timetableshown, settimetableshown] = useState(false)
  let [currenttimetable, setcurrenttimetable] = useState<{
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
  }>()
  let [timetable, settimetable] = useState<timetable[]>([])
  
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

      let date = new Date()
      
      // console.log(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`)

      // let datetosendtoapi = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

      let datetosendtoapi = `${date.getFullYear()}-`

      if ((date.getMonth() + 1).toString().length === 1){
        datetosendtoapi += "0" + (date.getMonth() + 1).toString()
      }

      const data: {success: boolean, weeks: timetable[]} = await handletimetable({
        date: datetosendtoapi,
        learner_id: learner_id
      }, authToken)

      if (data.success){
        settimetableshown(true)
        let date = new Date()
        setcurrenttimetable(data.weeks[0].days[date.getDay() - 1])
        console.log(data.weeks)
        settimetable(data.weeks)
      }

     console.log(data)
   })()
  }

  return (
    <div className="App">
      {!logedin ? <>
        <input placeholder='email' onChange={(e) => {
          setemail(e.target.value)
        }}/><br/>
        <input placeholder='password' onChange={(e) => {
          setpassword(e.target.value)
        }}/><br/>
        {/* <input placeholder='school id' onChange={(e) => {
          setschoolId(parseInt(e.target.value))
        }}/> */}
        <button onClick={handleconfirmlogin}>Login</button>
      </> : <>
        {!timetableshown ? <button onClick={handleshowtimetable}>
          Show Timetable
        </button> : <>
          <button onClick={() => {
            setcurrenttimetable(timetable[0].days[0])
          }}>Monday</button>
          <button onClick={() => {
            setcurrenttimetable(timetable[0].days[1])
          }}>Tuesday</button>
          <button onClick={() => {
            setcurrenttimetable(timetable[0].days[2])
          }}>Wednesday</button>
          <button onClick={() => {
            setcurrenttimetable(timetable[0].days[3])
          }}>Thursday</button>
          <button onClick={() => {
            setcurrenttimetable(timetable[0].days[4 ])
          }}>Friday</button>
          <table>
            <tr>
              {/* <th>
                period
              </th> */}
              <th>
                room
              </th>
              <th>
                subject
              </th>
            </tr>
            {typeof currenttimetable !== "undefined" ? currenttimetable.lessons.map(lesson => 
              <tr>
                <td>
                  {lesson.room.name}
                </td>
                <td>
                  {lesson.teaching_group.subject}
                </td>
              </tr>  
            ) : <></>}
          </table>  
        </>}
      </>}
    </div>
  );
}
// {typeof currenttimetable !== "undefined" ? currenttimetable.days.map(day =>  
//   day.lessons.map(lesson =>
//     <tr>
//       <td>
//         {lesson.room.name}
//       </td>
//       <td>
//         {lesson.teaching_group.subject}
//       </td>
//     </tr>
//   )
  
//   // day.periods.map((period, index) => {
//   //   if (!period.empty){
//   //     for (let i = 0; day.lessons.length; i++){
//   //       if (day.lessons[i].period_id === period.id){
//   //         return <tr>
//   //           {/* <td>
//   //             {index}
//   //           </td> */}
//   //           <td>
//   //             {day.lessons[i].room.name}
//   //           </td>
//   //           <td>
//   //             {day.lessons[i].teaching_group.subject}
//   //           </td>
//   //         </tr>
//   //       }
//   //     }
//   //   } else {
//   //     if (index === 4 || index === 7){
//   //       return <tr>
//   //         {/* <td>
//   //           {index}
//   //         </td> */}
//   //         <td></td>
//   //         <td>
//   //           Lunch
//   //         </td>
//   //       </tr>
//   //     } else {
//   //       return <tr>
//   //         {/* <td>
//   //           {index > 4 && index < 7 ? index - 1 : index > 7 ? index - 2 : index === 4 ? "" : index === 7 ? "" : index}
//   //           {period.external_id}
//   //         </td> */}
//   //         <td></td>
//   //         <td></td>
//   //       </tr>
//   //     }
//   //   }
//   // })
// ) : <></>}
//21otingay@ivc.tmet.org.uk
export default App;
