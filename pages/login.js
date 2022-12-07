import Head from 'next/head'
import Image from 'next/image'
import loginstyles from '../styles/Login.module.css'
import React, { useEffect, useRef, useLayoutEffect, useState, useCallback } from "react";
import axios from 'axios'

export default function Login() {

  const slideRef = React.createRef();

  const college = ["경영대학", "경제통상대학", "공과대학", "법과대학", "사회과학대학", "인문대학", "자연과학대학", "IT대학", "융합특성화자유전공학부", "차세대반도체학과"]
  const depart = [
    ["경영학부", "금융학부", "벤처중소기업학과", "회계학과", "벤처경영학과", "혁신경영학과", "복지경영학과", "회계세무학과"],
    ["경제학과", "글로벌통상학과", "국제무역학과", "금융경제학과", "통상산업학과"],
    ["건축학부", "기계공학부", "산업·정보시스템공학과", "유기신소재·파이버공학과", "전기공학부", "화학공학과"],
    ["국제법무학과", "법학과"],
    ["사회복지학부", "언론홍보학과", "정보사회학과", "정치외교학과", "평생교육학과", "행정학부"],
    ["기독교학과", "국어국문학과", "영어영문학과", "독어독문학과", "불어불문학과", "일어일문학과", "중어중문학과", "사학과", "철학과", "문예창작전공", "영화예술전공", "스포츠학부"],
    ["물리학과", "수학과", "의생명시스템학부", "정보통계·보험수리학과", "화학과"],
    ["전자정보공학부(IT융합전공)", "전자정보공학부(전자공학전공)", "컴퓨터학부", "글로벌미디어학부", "소프트웨어학부", "AI융합학부", "미디어경영학과"],
    ["융합특성화자유전공학부"],
    ["차세대반도체학과"]
    ]

  const [loginSubmit, setLoginSubmit] = useState(0)
  const [signUpSubmit, setSignUpSubmit] = useState(0)
  const [signUpMode, setSignUpMode] = useState(0)
  const [selectedCollege, setSelectedCollege] = useState(0)
  const [selectedDepart, setSelectedDepart] = useState(0)
  
  const [values, setValues] = useState({
    stdid: "",
    pwd: "",
    name: "",
    major: "",
  })

  const [errors, setErrors] = useState({
    stdid: "",
    pwd: "",
    name: "",
    major: "",
  })

  // 필드 방문 상태를 관리한다
  const [touched, setTouched] = useState({
    stdid: false,
    pwd: false,
    name: false,
    major: false,
  })

  // 필드값을 검증한다.
  const validate = useCallback(() => {
    const errors = {
      stdid: "",
      pwd: "",
      name: "",
      major: "",
    }

    if (!values.stdid) {
      errors.stdid = "이메일을 입력하세요"
    }
    if (!values.pwd) {
      errors.pwd = "비밀번호를 입력하세요"
    }
    if (signUpMode && !values.name) {
      errors.name = "이름을 입력하세요"
    }
    if (signUpMode && !values.major) {
      errors.major = "학과/학부를 입력하세요"
    }

    return errors
  }, [values])

  // 입력값이 변경될때 마다 검증한다.
  useEffect(() => {
    validate()
  }, [validate])

  const LoginForm = useCallback(() => {
    const handleChange = e => {
      console.log(e.target.value)
      setValues({
        ...values,
        [e.target.name]: e.target.value,
      })
    }

    // blur 이벤트가 발생하면 touched 상태를 true로 바꾼다
    const handleBlur = e => {
      setTouched({
        ...touched,
        [e.target.name]: true,
      })
    }
    
    const handleLoginSubmit = async e => {
      let status = 0

      e.preventDefault()

      // 모든 필드에 방문했다고 표시한다.
      setTouched({
        stdid: true,
        pwd: true,
        name: true,
        major: true,
      })

      // 필드 검사 후 잘못된 값이면 제출 처리를 중단한다.
      const errors = validate()
      // 오류 메세지 상태를 갱신한다
      setErrors(errors)
      // 잘못된 값이면 제출 처리를 중단한다.
      if (Object.values(errors).some(v => v)) {
        return
      }
      console.log("로그인중..")

      setLoginSubmit(1)
      
      console.log("로그인중..")
      await axios.post(process.env.FRONT_BASE_URL + "/api/crawl", {
        studentId: values.stdid,
        pwd: values.pwd
      }, {
        withCredentials: true
      }).then((response) => {
        console.log(response)
        if(response.data.status == 'FAIL') {
          alert("잘못된 학번 혹은 비밀번호입니다")
          setLoginSubmit(0)
          return
        }
        status = 1
      }).catch((error) => {
        console.log(error.response)
        alert("ERROR!")
        setLoginSubmit(0)
        return
      });

      if(status != 1) return

      await axios.post(process.env.FRONT_BASE_URL+"/apis/student/sign-in", {
        studentId: values.stdid,
        userId: values.stdid,
        pwd: values.pwd
      }, {
        withCredentials: true
      }).then((response) => {
        console.log(response)
        if(response.data.student == 'new') {
          status = 2
          let retval = confirm("미등록된 사용자입니다.\n회원가입을 진행하시겠습니까?")
          if(retval) {
            setSignUpMode(1)
          } else {
            setLoginSubmit(0)
          }
        }
      }).catch((error) => {
        console.log(error.response)
        alert("ERROR!")
        setLoginSubmit(0)
        status = 0
        return
      });
      
      if(status == 1) {
        window.location.href=process.env.FRONT_BASE_URL+'/?stdid='+values.stdid+'&pwd='+values.pwd;
      }
    }

    const handleSignUpSubmit = async e => {

      e.preventDefault()

      // 모든 필드에 방문했다고 표시한다.
      setTouched({
        stdid: true,
        pwd: true,
        name: true,
        major: true,
      })
      // 필드 검사 후 잘못된 값이면 제출 처리를 중단한다.
      const errors = validate()
      // 오류 메세지 상태를 갱신한다
      setErrors(errors)
      console.log("회원가입중..", errors)

      // 잘못된 값이면 제출 처리를 중단한다.
      if (Object.values(errors).some(v => v)) {
        return
      }

      setSignUpSubmit(1)
      console.log("회원가입중..")

      let retval = confirm("해당 정보로 회원가입을 진행합니다\n이름: "+values.name+"\n학부: "+values.major)
      if(!retval) {
        setSignUpMode(0)
        return
      }
      
      await axios.post(process.env.FRONT_BASE_URL+"/apis/student/sign-up", {
        studentId: values.stdid,
        major: values.major,
        studentName: values.name
      }, {
        withCredentials: true
      }).then((response) => {
        console.log(response)
      }).catch((error) => {
        console.log(error.response)
        alert("ERROR!")
        setSignUpSubmit(0)
        return
      });

      window.location.href=process.env.FRONT_BASE_URL+'/?stdid='+values.stdid+'&pwd='+values.pwd;
    }

    const changeSelectCollege = (e) => {
      setSelectedCollege(Number(e.target.value));
      setSelectedDepart(0)
    };
    
    const getCollegeSelectComponent = () => {
      let collegeOption = [];
      for(let i = 0; i < college.length; i++) {
        collegeOption.push(
          <option key={i} value={i}>{college[i]}</option>
        );
      }

      return (
        <select onChange={changeSelectCollege} name="college" id="collegeSelect" value={selectedCollege}>
          {collegeOption}
        </select>
      )
    };

    const changeSelectDepart = (e) => {
      setSelectedDepart(Number(e.target.value));
      setValues({
        ...values,
        [e.target.name]: depart[selectedCollege][e.target.value],
      })
    };
    
    const getDepartSelectComponent = () => {
      let departOption = [];
      for(let i = 0; i < depart[selectedCollege].length; i++) {
        departOption.push(
          <option key={i} value={i}>{depart[selectedCollege][i]}</option>
        );
      }

      return (
        <select onChange={changeSelectDepart} name="major" id="departSelect" value={selectedDepart}>
          {departOption}
        </select>
      )
    };

    return (
      <form onSubmit={signUpMode==0?handleLoginSubmit:handleSignUpSubmit} className={loginstyles.login_form}>
        <div>
          <h4>아이디</h4>
          <input
            type="text"
            name="stdid"
            placeholder="학번을 입력하세요"
            value={values.stdid}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loginSubmit==1?"disabled":""}
          />
          {touched.stdid && errors.stdid && <h6>{errors.stdid}</h6>}
        </div>
        <div>
          <h4>비밀번호</h4>
          <input
            type="password"
            name="pwd"
            placeholder="비밀번호를 입력하세요"
            value={values.pwd}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loginSubmit==1?"disabled":""}
          />
          {touched.pwd && errors.pwd && <h6>{errors.pwd}</h6>}
        </div>

        {signUpMode==1?(<hr/>):""}
        {signUpMode==1?(
          <div>
            <h4>이름</h4>
            <input
              type="text"
              name="name"
              placeholder="이름을 입력하세요"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={signUpSubmit==1?"disabled":""}
            />
            {touched.name && errors.name && <h6>{errors.name}</h6>}
          </div>
        ):""}
        {signUpMode==1?(
          <div>
            <div>
              <h4>대학</h4>
              {getCollegeSelectComponent()}
            </div>
            <div>
              <h4>학과/학부</h4>
              {getDepartSelectComponent()}
            </div>
          </div>
        ):""}
        <button type="submit">{signUpMode==0?"로그인":"회원가입"}</button>
      </form>
    )
  }, [values, errors, touched, loginSubmit, signUpSubmit, signUpMode, selectedCollege, selectedDepart])

  return (
    <div ref={slideRef}>
      <Head>
        <title>LMSSU 로그인</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className={loginstyles.login_board}>
          <h2>LMSSU:로그인</h2>
          {LoginForm()}
        </div>
      </main>
    </div>
  )
}
