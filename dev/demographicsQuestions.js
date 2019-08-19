
  let demographicsQuestions = [
    {
      type: "radiogroup",
      name: "drawing_implement",
      isRequired: true,
      title: "What did you use to draw?",
      choices: ["Laptop trackpad", "Mouse", "Standalone trackpad", "Touch screen", "Other"]
    },
    {
      type: "radiogroup",
      name: "gender",
      isRequired: true,
      title: "What is your gender?",
      choices: ["Male", "Female", "Other", "NA|Prefer not to say"]
    },

    {
      type: "radiogroup",
      name: "native",
      isRequired: true,
      title: "Are you a native English speaker",
      choices: ["Yes", "No"]
    },
    {
      type: "text",
      name: "native language",
      visibleIf: "{native}='No'",
      title: "Please indicate your native language or languages:"
    },

    {
      type: "text",
      name: "languages",
      title: "What other languages do you speak?"
    },

    { type: "text", name: "age", title: "What is your age?", width: "auto" },
    
    {
      type: "radiogroup",
      name: "artskill",
      isRequired: true,
      title: "How well can you draw?",
      choices: ["1|Below average", "2|Slightly below average", "3|Average", "4|Slightly above average", "5|Above average"]
    },
    

    {
      type: "radiogroup",
      name: "degree",
      isRequired: true,
      title: "What is the highest degree or level of school you have completed. If currently enrolled, highest degree received.",
      choices: [
        "1_lt_high_school|Less than high school",
        "2_high_school|High school diploma",
        "3_some_college|Some college, no degree",
        "4_associates|Associate's degree",
        "5_bachelors|Bachelor's degree",
        "6_masters|Master's degree",
        "7_phd|PhD, law, or medical degree",
        "NA|Prefer not to say"
      ]
    },
    {
      type: "text",
      name: "favorite hs subject",
      visibleIf: "{degree}='1_lt_high_school' or {degree}='2_high_school' or {degree}='3_some_college'",
      title: "What was your favorite subject in high school?"
    },
    {
      type: "text",
      name: "college",
      visibleIf: "{degree}='4_associates' or {degree}='5_bachelors' or {degree}='6_masters' or {degree}='7_phd'",
      title: "What did you study in college?"
    },
    {
      type: "text",
      name: "grad",
      visibleIf: "{degree}='6_masters' or {degree}='7_phd'",
      title: "What did you study in graduate school?"
    }
  ];