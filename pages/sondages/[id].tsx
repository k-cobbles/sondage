import React, { useEffect, useState } from "react";
import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import Layout from "../../components/Layout";
import Button from '../../components/Button';


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


export default function EditSondage({
  sondage: { _id, title, description, answers },
}: ContentPageProps) {
  const [sondageTitle, setSondageTitle] = useState(title);
  const [sondageDescription, setSondageDescription] = useState(description);
  const [sondageAnswers, setSondageAnswers] = useState(answers);
  const [newAnswer, setNewAnswer] = useState('');
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!!newAnswer) {
      onClickAddAnswer() //to try
    }
    if (sondageTitle && sondageDescription && sondageAnswers.length > 1 && !newAnswer) { // try sondage check
      try {
        let response = await fetch(
          "http://localhost:3000/api/sondages/editSondage?id=" + _id,
          {
            method: "POST",
            body: JSON.stringify({
              title: sondageTitle,
              description: sondageDescription,
              answers: sondageAnswers,
            }),
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
            },
          }
        );
        response = await response.json();
        setMessage("Sondage edited successfully!");
        setError('')
      } catch (errorMessage: any) {
        setError(errorMessage);
      }
    } else {
      return setError("All fields are required");
    }
  };

  // no such sondage exists
  // if (!title && !description && !answers.length && !_id && typeof window) {
  //   return (window.location.href = "/");
  // }


  const updateAnswers = (event: React.ChangeEvent<HTMLInputElement>, answerIndex: number) => {
    setSondageAnswers((state) => state.map((item, index) => {
      if (index === answerIndex) {

        return {
          answer: event.target.value,
          count: 0,
        } as Answer;
      } else {
        return item
      }
    }))
  }

  const onClickAddAnswer = () => {
    setSondageAnswers(s => [...s, { answer: newAnswer, count: 0 }])
    setNewAnswer('')
  };

  const onClickRemoveAnswer = (i: number) => {
    setSondageAnswers(state => {
      state.splice(i, 1);
      const newState = state;
      return [...newState];
    })
  }

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="form">
        {error ? <div className="alert-error">{error}</div> : null}
        {message ? <div className="alert-message">{message}</div> : null}
        <h1>Edit your sondage</h1>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            placeholder="Title of the sondage"
            onChange={(e) => setSondageTitle(e.target.value)}
            value={sondageTitle}
          />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea
            name="content"
            placeholder="Content of the sondage"
            value={sondageDescription}
            onChange={(e) => setSondageDescription(e.target.value)}
            cols={20}
            rows={8}
          />
        </div>
        <div className="form-group answers">
          <label>Answers</label>
          {!!sondageAnswers.length ? sondageAnswers.map((a, i) =>
            <div className="answer" key={a.answer + i}>
              <input
                disabled={true}
                key={a.answer + i}
                type="text"
                value={a.answer}
              />
              <Button
                onClick={() => onClickRemoveAnswer(i)}
                size="small"
                className="remove"
              >
                remove
              </Button>
            </div>
          ) : null}
          <input
            key="newAnswer"
            onChange={(e) => setNewAnswer(e.target.value)}
            type="text"
            placeholder='New answer'
            value={newAnswer}
          />
        </div >
        <div className="form-group button">
          <Button
            disabled={!newAnswer}
            onClick={onClickAddAnswer}
          >
            another answer pls
          </Button>
          <Button
            className="submit_btn"
            type="submit"
          >
            Save changes
          </Button>
        </div>
      </form>
      <style jsx>
        {`
          .form-group {
            padding-bottom: 12px;
          }
          .form-group > label {
            display: block;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .form-group input[type="text"] {
            padding: 10px;
            width: 100%;
          }
          .form-group textarea {
            padding: 10px;
            width: 100%;
          }
          .form-group.button {
            display: flex;
            justify-content: flex-end;
            padding: 12px 0;
          }
          .form-group.answers {

          }
          .form-group.answers .answer {
            position: relative;
          }
          .form-group.answers input:disabled {
            margin-bottom: 12px;
          }
          .form-group.answers :global(button) {
            position: absolute;
            top: 4px;
            right: 6px;
          }
          .form-group :global(button) {
            margin-left: 12px;
          }
        `}
      </style> 
    </Layout>
  );
}
