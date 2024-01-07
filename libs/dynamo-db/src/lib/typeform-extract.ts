export function extractSignupUserInformation(formData: any) {
  const variables = formData.variables;
  const fields = formData.definition.fields;
  const answers = formData.answers;
  //   console.log(fields);
  // console.log(answers);

  // TODO: NEED TO INSERT FIELDS AND VARIABLES INTO THE DIFFERENT RESPONSES
  const qaArray = [];

  // FETCHES DATA FROM THE Q&A
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const answer = answers[i];
    const answerType = answer.type;
    let answerContent;
    if (answerType === 'choice') {
      answerContent = answer.choice.label;
    } else if (answerType === 'choices') {
      answerContent = answer.choices.labels.join(', ');
    } else if (answerType === 'text') {
      answerContent = answer.text;
    } else if (answerType === 'date') {
      answerContent = answer.date;
    } else if (answerType === 'number') {
      answerContent = answer.number;
    } else if (answerType === 'phone_number') {
      answerContent = answer.phone_number;
    } else if (answerType === 'email') {
      answerContent = answer.email;
    }
    const qa = {
      question: field.title,
      answer: answerContent,
    };
    qaArray.push(qa);
  }

  // FETCHES EVALUATED DATA FROM THE Q&A
  const evaluationArray = [];
  for (let i = 0; i < variables.length; i++) {
    const variable = variables[i];
    const variableType = variable.type;
    let variableContent;

    if (variableType === 'number') {
      variableContent = variable.number;
    } else if (variableType === 'text') {
      variableContent = variable.text;
    }

    const evaluation = {
      key: variable.key,
      value: variableContent,
    };
    evaluationArray.push(evaluation);
  }

  console.log(evaluationArray);

  const userProfile = {
    evaluations: evaluationArray,
    qas: qaArray,
  };

  // console.log(qaArray);
  return userProfile;
}
