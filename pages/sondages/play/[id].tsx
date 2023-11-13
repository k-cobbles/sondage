import React, { useEffect, useState } from "react";
import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import Layout from "../../../components/Layout";
import { useRouter } from 'next/router';
import Button from '../../../components/Button';
import InputRadio from '../../../components/InputRadio';


type PageParams = {
  id: string;
};

type ContentPageProps = {
  sondage: Sondage;
};

type ResponseFromServer = {
  title: string;
  description: string;
  answers: Answer[];
  _id: string;
};

const emptyAnswer: Answer = {
  answer: '',
  count: 0,
}

const emptyAnswers = [
  emptyAnswer,
  emptyAnswer,
  emptyAnswer,
]

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PageParams>): Promise<
  GetStaticPropsResult<ContentPageProps>
> {
  try {
    let response = await fetch(
      "http://localhost:3000/api/sondages/getSondage?id=" + params?.id
    );

    let responseFromServer: ResponseFromServer = await response.json();

    return {
      // Passed to the page component as props
      props: {
        sondage: {
          _id: responseFromServer._id,
          title: responseFromServer.title,
          description: responseFromServer.description,
          answers: responseFromServer.answers,
        },
      },
    };
  } catch (e) {
    console.log("error ", e);
    return {
      props: {
        sondage: {
          _id: "  ",
          title: "  ",
          description: "  ",
          answers: emptyAnswers,
        },
      },
    };
  }
}


export async function getStaticPaths() {
  let sondages = await fetch("http://localhost:3000/api/sondages/getSondages");

  let sondageFromServer: [Sondage] = await sondages.json();
  return {
    paths: sondageFromServer.map((sondage) => {
      return {
        params: {
          id: sondage._id,
        },
      };
    }),
    fallback: false, // can also be true or 'blocking'
  };
}


export default function PlaySondage({
  sondage: { _id, title, description, answers },
}: ContentPageProps) {
  // const [sondageTitle, setSondageTitle] = useState(title);
  // const [sondageDescription, setSondageDescription] = useState(description);
  // const [sondageAnswers, setSondageAnswers] = useState(answers)

  const [newCount, setNewCount] = useState(-1);
  const [answerIndex, setAnswerIndex] = useState(-1);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter()

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (answerIndex > -1) {
      try {
        let response = await fetch(
          "http://localhost:3000/api/sondages/updateCount?id=" + _id,
          {
            method: "POST",
            body: JSON.stringify({
              answerIndex: answerIndex,
            }),
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
            },
          }
        );
        response = await response.json();
        setMessage("Vote sent");
        router.replace({
          pathname: '/sondages/result/' + _id,
        })
        
      } catch (errorMessage: any) {
        setError(errorMessage);
      }
    } else {
      return setError("No vote selected");
    }
  };

  // no such sondage exists
  if (!title && !description && !answers.length && !_id && typeof window) {
    return (window.location.href = "/");
  }



  return (
    <Layout>
      <form
        onSubmit={handleSubmit}
        className="form"
      >
        {error ? <div className="alert-error">{error}</div> : null}
        {message ? <div className="alert-message">{message}</div> : null}
        <div className="form-group">
          <h1>{title}</h1>
        </div>
        <div className="form-group">
          {/* <label>Description</label> */}
          <p>{description}</p>
        </div>
        <div className="form-group">
          {/* <label>Answers</label> */}
          <div className="form-group answers">
            {answers.map((answer, index) => {
              return (
                <InputRadio checked={answerIndex === index} name="play" text={answer.answer} key={answer.answer + index} onClick={() => setAnswerIndex(index)} />
              );
            })}
          </div>
        </div>
        <div className="form-group button">
          <Button type="submit" className="submit_btn" disabled={answerIndex === -1}>Confirm vote</Button>
        </div>
      </form>
      <style jsx>
        {`
          .form-group.answers{
            margin-bottom: 12px;
          }
          .form-group > label {
            display: block;
            margin-bottom: 10px;
            font-weight: bold;
            font-style: italic;
          }
          .form-group > h1 {
            margin-bottom: 0.1em;
          }
          .form-group > p {
            margin-bottom: 60px;
          }
          .form-group.button {
            display: flex;
            justify-content: flex-end;
            padding: 12px 0;
          }
        `}
      </style>
    </Layout>
  );
};
