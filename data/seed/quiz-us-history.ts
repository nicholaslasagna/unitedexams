import type { QuizSet } from "@/lib/types";

/**
 * History of the United States Since 1877 (HIST-2301) — Fall 2026.
 *
 * The standard survey arc: Reconstruction's end through the Gilded Age and
 * Progressive reform, then depression, two world wars, the Cold War and the
 * civil rights era.
 *
 * Questions favour causation and significance over date recall, which is
 * what survey exams actually reward.
 */
export const usHistoryQuizSets: QuizSet[] = [
  {
    id: "hist-reconstruction-gilded",
    courseId: "us-history-since-1877",
    title: "Reconstruction, the Gilded Age & Progressive Reform",
    description:
      "The 1877 compromise, industrialisation and labour, immigration and urban growth, Populism, and the Progressive response.",
    difficulty: "Intermediate",
    estMinutes: 28,
    tags: ["reconstruction", "gilded-age", "populism", "progressive-era"],
    timerDefaultMinutes: 25,
    questions: [
      {
        id: "hist-rg-q1",
        type: "single",
        prompt:
          "What was the principal consequence of the Compromise of 1877?",
        options: [
          "Federal troops withdrew from the South, ending Reconstruction and allowing white Democratic 'redeemer' governments to take power",
          "It extended Reconstruction for another decade",
          "It granted immediate voting rights to women",
          "It abolished the Electoral College"
        ],
        correct: [0],
        explanation:
          "The disputed 1876 election was resolved by seating Hayes in exchange for removing the remaining federal troops. Without federal enforcement, Black political participation in the South was steadily dismantled through violence, fraud and later formal disenfranchisement.",
        walkthroughSteps: [
          "The 1876 Hayes–Tilden election left disputed returns in three southern states.",
          "The informal settlement gave Hayes the presidency in return for ending federal military occupation.",
          "Federal troops had been the practical guarantee behind the Fourteenth and Fifteenth Amendments in the South.",
          "Once withdrawn, 'redeemer' governments moved to restrict Black voting — first by intimidation and fraud, then from the 1890s by poll taxes, literacy tests and grandfather clauses.",
          "The constitutional rights remained on paper; enforcement did not return in earnest until the 1960s. That gap is the through-line of the whole course."
        ],
        tags: ["reconstruction", "1877", "compromise"]
      },
      {
        id: "hist-rg-q2",
        type: "single",
        prompt:
          "What did the Supreme Court hold in *Plessy v. Ferguson* (1896)?",
        options: [
          "That 'separate but equal' facilities satisfied the Fourteenth Amendment's equal protection clause",
          "That segregation in public schools was unconstitutional",
          "That the Fifteenth Amendment protected literacy tests",
          "That Congress could not regulate interstate commerce"
        ],
        correct: [0],
        explanation:
          "*Plessy* upheld a Louisiana railcar segregation law, holding that separate accommodations did not imply inequality. It supplied the legal cover for Jim Crow for nearly sixty years, until *Brown v. Board of Education* (1954) rejected the doctrine in public education.",
        walkthroughSteps: [
          "Homer Plessy deliberately violated Louisiana's Separate Car Act to create a test case.",
          "The Court ruled 7–1 that legally mandated separation was not itself a badge of inferiority.",
          "Justice Harlan's lone dissent — 'our Constitution is color-blind' — is a standard exam quotation.",
          "The decision legitimised segregation statutes across the South and in many northern practices.",
          "*Brown* (1954) overturned it for schools, holding that separate educational facilities are inherently unequal — the contrast between the two cases is a frequent essay prompt."
        ],
        tags: ["jim-crow", "supreme-court", "plessy"]
      },
      {
        id: "hist-rg-q3",
        type: "multi",
        prompt:
          "Select every demand that appeared in the Populist (People's Party) platform of the 1890s.",
        options: [
          "Free and unlimited coinage of silver",
          "Government ownership of railroads and telegraphs",
          "A graduated income tax",
          "Direct election of U.S. senators",
          "Repeal of the Sherman Antitrust Act"
        ],
        correct: [0, 1, 2, 3],
        explanation:
          "The 1892 Omaha Platform demanded free silver, public ownership of railroads and telegraphs, a graduated income tax and direct election of senators. Populists wanted *more* restraint on corporate power, not less, so repealing antitrust law was the opposite of their programme.",
        walkthroughSteps: [
          "Populism grew from agrarian distress: falling crop prices, high rail freight rates and crushing debt.",
          "Free silver was the monetary demand — inflating the currency would ease debtors' burdens.",
          "Railroads and telegraphs were seen as natural monopolies extracting from farmers, hence the call for public ownership.",
          "A graduated income tax and direct election of senators aimed at shifting political power away from concentrated wealth.",
          "Several of these were later enacted: the Sixteenth Amendment (income tax, 1913) and the Seventeenth (direct election, 1913) — so Populism lost electorally but won substantially on policy."
        ],
        tags: ["populism", "omaha-platform", "gilded-age"]
      },
      {
        id: "hist-rg-q4",
        type: "single",
        prompt:
          "How did Progressive-era reformers most characteristically differ from Populists?",
        options: [
          "Progressives were largely urban, middle-class and focused on expert administration and regulation, rather than agrarian and monetary",
          "Progressives opposed all government regulation of business",
          "Progressives were exclusively a southern agrarian movement",
          "Progressives sought to restore the pre-industrial economy"
        ],
        correct: [0],
        explanation:
          "Progressivism drew on urban middle-class professionals and emphasised efficiency, expertise and regulation — commissions, scientific management, public health. Populism was rural, debtor-focused and monetary. They overlapped on curbing corporate power but differed in base and method.",
        walkthroughSteps: [
          "Populist base: indebted farmers in the South and Plains; central demand was monetary inflation.",
          "Progressive base: urban middle-class professionals, journalists, social workers, academics.",
          "Progressive method: regulate through expert bodies — the Pure Food and Drug Act, the Federal Reserve, the FTC.",
          "Shared ground: hostility to unaccountable corporate power and to machine politics.",
          "Worth noting the limits for essay purposes: Progressivism largely excluded Black Americans from its reforms, and its enthusiasm for 'efficiency' extended to immigration restriction and, at its worst, eugenics."
        ],
        tags: ["progressive-era", "reform", "comparison"]
      },
      {
        id: "hist-rg-q5",
        type: "single",
        prompt:
          "The Homestead (1892) and Pullman (1894) strikes are usually cited to illustrate what pattern?",
        options: [
          "Federal and state power siding with employers against organised labour",
          "The consistent success of industrial unions in the era",
          "Federal protection of the right to strike",
          "The absence of labour conflict before 1900"
        ],
        correct: [0],
        explanation:
          "In both, state force decided the outcome against the strikers — Pennsylvania militia at Homestead, federal troops and a sweeping injunction at Pullman. They demonstrate how little legal protection organised labour had before the 1930s.",
        walkthroughSteps: [
          "Homestead: Carnegie Steel locked out the union and brought in Pinkerton agents; the state militia broke the strike and the union was destroyed.",
          "Pullman: a nationwide boycott by the American Railway Union was met with a federal injunction on the grounds it obstructed the mails, and troops sent over the Illinois governor's objection.",
          "*In re Debs* (1895) upheld the injunction, making it a standard anti-strike instrument.",
          "The pattern only shifted with the Norris–LaGuardia Act (1932) and the Wagner Act (1935), which finally protected collective bargaining.",
          "Use these two as the paired example whenever a question asks about state–labour relations in the Gilded Age."
        ],
        tags: ["labour", "strikes", "gilded-age"]
      },
      {
        id: "hist-rg-q6",
        type: "single",
        prompt:
          "What was the significance of the 'new immigration' of roughly 1880–1920?",
        options: [
          "Arrivals shifted toward southern and eastern Europe, fuelling nativist reaction and eventual quota restriction",
          "Immigration to the United States nearly ceased",
          "Immigrants came overwhelmingly from Britain and Germany, as before",
          "It prompted the immediate extension of citizenship to all arrivals"
        ],
        correct: [0],
        explanation:
          "The origin shifted from northern and western Europe to Italy, Poland, Russia and the Austro-Hungarian lands — largely Catholic and Jewish. Nativist reaction culminated in the 1921 and 1924 quota acts, which set quotas by national origin to preserve the earlier ethnic composition.",
        walkthroughSteps: [
          "'Old' immigration: British, Irish, German, Scandinavian, mainly Protestant.",
          "'New' immigration: Italian, Polish, Russian, Greek, Slavic — heavily Catholic and Jewish, settling in industrial cities.",
          "Reaction combined religious prejudice, labour-competition fears and pseudo-scientific race theory.",
          "The Emergency Quota Act (1921) and Johnson–Reed Act (1924) tied quotas to earlier census composition, sharply cutting southern and eastern European entry and excluding most Asian immigration outright.",
          "The system stood until the Immigration and Nationality Act of 1965 replaced national-origin quotas."
        ],
        tags: ["immigration", "nativism", "quota-acts"]
      },
      {
        id: "hist-rg-q7",
        type: "single",
        prompt:
          "What was the central argument of the debate between Booker T. Washington and W. E. B. Du Bois?",
        options: [
          "Whether Black advancement should come through vocational training and gradual economic self-help, or through immediate insistence on civil and political rights",
          "Whether to support the Confederacy",
          "Whether Black Americans should emigrate to Africa",
          "Whether to abolish public education"
        ],
        correct: [0],
        explanation:
          "Washington's Atlanta Compromise (1895) urged economic self-improvement and temporary accommodation on political rights. Du Bois rejected accommodation, calling for immediate civil rights, higher education for a 'Talented Tenth', and helping found the NAACP in 1909.",
        walkthroughSteps: [
          "Washington: vocational education at Tuskegee, economic usefulness first, agitation deferred.",
          "Du Bois: *The Souls of Black Folk* (1903) attacked that position directly as conceding too much.",
          "Du Bois argued political rights were the precondition for economic gain, not its reward.",
          "The Niagara Movement (1905) led to the NAACP (1909) and a strategy of litigation and publicity.",
          "For essays, note both were responding to the same collapse of Reconstruction protections — they differed on tactics under constraint, not on the goal."
        ],
        tags: ["civil-rights", "washington", "du-bois"]
      },
      {
        id: "hist-rg-q8",
        type: "free",
        prompt:
          "Explain how industrialisation between 1877 and 1900 reshaped American society. Address at least three of: labour, immigration, urbanisation, and the role of government.",
        explanation:
          "A synthesis question: industrial scale drove wage labour and union conflict, mass immigration and urban growth, and a slow shift from laissez-faire toward regulation.",
        sampleAnswer:
          "Industrialisation transformed the United States from a largely agrarian republic into the world's leading industrial economy, and the social consequences ran in several directions at once. Labour: production moved into large firms where workers sold time rather than owned craft, producing wage dependence, dangerous conditions, and organised responses from the Knights of Labor and the AFL — met, at Homestead and Pullman, by state force siding with employers. Immigration: industrial demand pulled roughly 20 million people, increasingly from southern and eastern Europe, into cities where they supplied cheap labour and encountered nativist reaction that ended in the 1920s quotas. Urbanisation: cities grew explosively, producing tenement overcrowding, disease and machine politics like Tammany Hall, but also mass transit, public health, and the settlement house movement. Government: the era began committed to laissez-faire, with courts using the Fourteenth Amendment to strike down regulation, yet the scale of corporate power forced the first federal responses — the Interstate Commerce Act (1887) and the Sherman Antitrust Act (1890) — which were weakly enforced at first but established the principle that the federal government could regulate private enterprise, the foundation Progressives built on.",
        hintSteps: [
          "Pick three strands and give each a claim, a concrete example and a consequence — do not just list facts.",
          "For labour, think about what changed in the *relationship* between worker and employer, not only conditions.",
          "For government, trace the direction of travel across the period rather than describing a fixed position.",
          "Finish by connecting the period forward to Progressive reform, which shows you understand it as a cause rather than an episode."
        ],
        walkthroughSteps: [
          "Frame the change: railroads, steel and oil created national markets and firms of unprecedented scale.",
          "Labour: the shift from craft ownership to wage dependence; unionisation attempts; and state power repeatedly deciding disputes for employers.",
          "Immigration: industrial demand as the pull factor, the shift in origin countries, and the nativist reaction it generated.",
          "Urbanisation: population concentration, tenement conditions, political machines, and the reform responses they provoked.",
          "Government: from laissez-faire and *Lochner*-style judicial hostility toward the first regulatory statutes of 1887 and 1890.",
          "Draw the causal line: these pressures produced the Populist and then Progressive movements, so the period explains what follows rather than standing alone.",
          "A strong answer names specific evidence for each claim — Carnegie and Homestead, Ellis Island and the 1924 Act, Tammany Hall, the ICC and Sherman."
        ],
        tags: ["industrialisation", "synthesis", "essay"]
      }
    ]
  },
  {
    id: "hist-depression-modern",
    courseId: "us-history-since-1877",
    title: "Depression, World War, the Cold War & Civil Rights",
    description:
      "The New Deal's reordering of federal power, wartime mobilisation, containment abroad, and the civil rights movement's legal and legislative victories.",
    difficulty: "Intermediate",
    estMinutes: 30,
    tags: ["new-deal", "world-war-ii", "cold-war", "civil-rights"],
    timerDefaultMinutes: 28,
    questions: [
      {
        id: "hist-dm-q1",
        type: "single",
        prompt:
          "What was the most lasting structural change brought by the New Deal?",
        options: [
          "A permanent expansion of federal responsibility for economic security, institutionalised in programmes such as Social Security",
          "The nationalisation of American industry",
          "The elimination of unemployment by 1936",
          "A balanced federal budget"
        ],
        correct: [0],
        explanation:
          "The New Deal did not end the Depression — rearmament did — but it permanently changed what Americans expected government to do. Social Security, deposit insurance, securities regulation and federal labour rights all outlasted the emergency.",
        walkthroughSteps: [
          "Relief, recovery, reform: the first two were emergency measures, the third is what endured.",
          "Social Security (1935) created old-age insurance and unemployment compensation as ongoing federal obligations.",
          "The FDIC ended the bank-run dynamic; the SEC brought securities markets under federal supervision.",
          "The Wagner Act (1935) protected collective bargaining, and union density rose sharply for a generation.",
          "Unemployment remained high through the 1930s and fell decisively only with war mobilisation — a point exam answers should concede rather than overstate the New Deal's recovery record."
        ],
        tags: ["new-deal", "social-security", "federal-power"]
      },
      {
        id: "hist-dm-q2",
        type: "single",
        prompt:
          "What did the doctrine of **containment**, as articulated by George Kennan, propose?",
        options: [
          "Resisting Soviet expansion at its edges rather than attacking the Soviet Union or accepting its expansion",
          "Immediate military rollback of Soviet control in Eastern Europe",
          "Complete withdrawal from European affairs",
          "Sharing nuclear technology with the Soviet Union"
        ],
        correct: [0],
        explanation:
          "Kennan's Long Telegram and 'X' article argued Soviet expansion was driven by internal insecurity and would yield to patient, firm counter-pressure at the periphery. Containment shaped the Truman Doctrine, the Marshall Plan and NATO, and framed American policy for four decades.",
        walkthroughSteps: [
          "Kennan's premise: Soviet hostility was structural and would not be resolved by negotiation alone.",
          "The prescription was counter-pressure wherever expansion was attempted, not war and not withdrawal.",
          "Truman Doctrine (1947): aid to Greece and Turkey, framed as supporting free peoples resisting subjugation.",
          "Marshall Plan (1948): economic reconstruction to remove the conditions communism exploited.",
          "NATO (1949) added collective military commitment. Kennan later objected that his argument had been read too militarily — a nuance worth citing."
        ],
        tags: ["cold-war", "containment", "kennan"]
      },
      {
        id: "hist-dm-q3",
        type: "multi",
        prompt:
          "Select every accurate statement about the home front during the Second World War.",
        options: [
          "Women entered industrial employment in unprecedented numbers",
          "Roughly 120,000 Japanese Americans were forcibly relocated and interned",
          "Federal spending and employment rose enormously, ending Depression unemployment",
          "The armed forces were fully racially integrated during the war",
          "Rationing and price controls were imposed on consumer goods"
        ],
        correct: [0, 1, 2, 4],
        explanation:
          "Mobilisation reshaped the home front — women in war industry, mass internment under Executive Order 9066, war spending that ended unemployment, and rationing. The military remained segregated throughout; Truman ordered integration only in 1948 by Executive Order 9981.",
        walkthroughSteps: [
          "War production drew millions of women into industrial work, symbolised by 'Rosie the Riveter', though most were pushed out afterwards.",
          "Executive Order 9066 (1942) authorised removal of Japanese Americans, two-thirds of them citizens; *Korematsu* (1944) upheld it.",
          "Federal spending dwarfed New Deal outlays and unemployment effectively vanished — the strongest evidence for the fiscal reading of the recovery.",
          "The armed forces stayed segregated; the Double V campaign demanded victory abroad and at home, and integration came in 1948.",
          "The Office of Price Administration ran rationing and price controls on fuel, food and tyres."
        ],
        tags: ["world-war-ii", "home-front", "internment"]
      },
      {
        id: "hist-dm-q4",
        type: "single",
        prompt:
          "Why is *Brown v. Board of Education* (1954) considered a turning point?",
        options: [
          "It rejected 'separate but equal' in public education, overturning *Plessy*'s logic and giving the civil rights movement a constitutional foundation",
          "It immediately desegregated all American schools within a year",
          "It legalised segregation in northern states",
          "It was decided by a narrow 5–4 majority"
        ],
        correct: [0],
        explanation:
          "The unanimous decision held that separate educational facilities are inherently unequal. Its immediate practical effect was limited — 'all deliberate speed' permitted years of resistance — but it removed the legal foundation of segregation and legitimised the movement that followed.",
        walkthroughSteps: [
          "The NAACP Legal Defense Fund, led by Thurgood Marshall, built the case over years of narrower precedents.",
          "Warren secured unanimity deliberately, to deny segregationists any dissent to rally around.",
          "The reasoning drew on the psychological harm of segregation rather than facility equality — sidestepping *Plessy*'s premise.",
          "*Brown II* (1955) ordered desegregation with 'all deliberate speed', language that enabled a decade of delay and 'massive resistance'.",
          "So the significance is legal and symbolic: it made segregation defensible only as defiance of the Constitution, which shaped everything from Little Rock to the 1964 Act."
        ],
        tags: ["civil-rights", "brown", "supreme-court"]
      },
      {
        id: "hist-dm-q5",
        type: "single",
        prompt:
          "What did the Voting Rights Act of 1965 do that the Civil Rights Act of 1964 did not?",
        options: [
          "It provided federal machinery — suspending literacy tests and sending federal examiners — to enforce voting rights directly",
          "It desegregated public accommodations",
          "It banned employment discrimination",
          "It ended school segregation"
        ],
        correct: [0],
        explanation:
          "The 1964 Act addressed public accommodations and employment. The 1965 Act attacked disenfranchisement with enforcement machinery: suspending literacy tests, dispatching federal examiners, and requiring preclearance of electoral changes in covered jurisdictions. Black registration in the South rose sharply within years.",
        walkthroughSteps: [
          "Civil Rights Act 1964: Title II on public accommodations, Title VII on employment, plus funding leverage against segregated institutions.",
          "It did comparatively little about voting, where literacy tests and administrative obstruction remained effective.",
          "Selma and the violence at the Edmund Pettus Bridge in March 1965 supplied the political impetus.",
          "The Voting Rights Act suspended literacy tests, authorised federal examiners to register voters, and imposed Section 5 preclearance on jurisdictions with a history of discrimination.",
          "Registration among Black voters in Mississippi rose from under 7% to over 50% within a few years — the clearest measure of enforcement mattering more than declaration."
        ],
        tags: ["civil-rights", "voting-rights-act", "legislation"]
      },
      {
        id: "hist-dm-q6",
        type: "single",
        prompt:
          "What was the significance of the Cuban Missile Crisis (1962)?",
        options: [
          "The closest approach to nuclear war, after which both sides built crisis-management mechanisms and moved toward arms control",
          "It began the Cold War",
          "It resulted in a American invasion of Cuba",
          "It ended the Soviet Union"
        ],
        correct: [0],
        explanation:
          "Thirteen days of confrontation over Soviet missiles in Cuba ended with their withdrawal, a US pledge not to invade, and a quiet removal of American missiles from Turkey. The shock produced the Moscow–Washington hotline and, in 1963, the Limited Test Ban Treaty.",
        walkthroughSteps: [
          "U-2 reconnaissance discovered medium-range missile sites under construction in Cuba in October 1962.",
          "Kennedy chose a naval 'quarantine' over an air strike, leaving room for negotiation.",
          "Resolution: public Soviet withdrawal and a US non-invasion pledge, plus a secret agreement to remove Jupiter missiles from Turkey.",
          "Both leaders drew the same lesson — that they had come far closer to catastrophe than either intended.",
          "Consequences: the direct hotline in 1963, the Limited Test Ban Treaty the same year, and the beginnings of the arms-control track that ran through détente."
        ],
        tags: ["cold-war", "cuban-missile-crisis", "nuclear"]
      },
      {
        id: "hist-dm-q7",
        type: "single",
        prompt:
          "The Great Migration refers to what, and what were its principal causes?",
        options: [
          "The movement of roughly six million Black Americans from the rural South to northern and western cities, driven by Jim Crow, violence and industrial job demand",
          "European immigration through Ellis Island",
          "Westward settlement under the Homestead Act",
          "The movement of factories to the Sun Belt after 1970"
        ],
        correct: [0],
        explanation:
          "From about 1916 to 1970, roughly six million Black southerners left for cities such as Chicago, Detroit and New York. Push factors were disenfranchisement, lynching and sharecropping; pull factors were wartime industrial labour shortages and higher wages.",
        walkthroughSteps: [
          "First wave from around 1916, as the First World War cut European immigration and created northern labour shortages.",
          "Push: Jim Crow law, racial violence, boll weevil damage to cotton, and debt peonage under sharecropping.",
          "Pull: industrial wages several times southern agricultural pay, and existing kin networks in northern cities.",
          "Second, larger wave during and after the Second World War, extending to the West Coast defence industries.",
          "Consequences: Black political power in northern cities, the Harlem Renaissance, and the northern housing segregation and job discrimination that shaped the movement's later phase."
        ],
        tags: ["great-migration", "civil-rights", "urbanisation"]
      },
      {
        id: "hist-dm-q8",
        type: "free",
        prompt:
          "Assess how far the civil rights movement between 1954 and 1968 achieved its aims. Use specific evidence and address both successes and limits.",
        explanation:
          "A judgement question: the movement decisively dismantled legal segregation and disenfranchisement, while economic and northern structural inequality proved far more resistant.",
        sampleAnswer:
          "Between 1954 and 1968 the movement achieved almost everything it sought in law and comparatively little of what it sought in economics. The legal victories were decisive: *Brown* (1954) removed the constitutional basis of segregation; the Montgomery bus boycott (1955–56) demonstrated mass non-violent pressure and produced *Browder v. Gayle*; the Civil Rights Act (1964) ended segregation in public accommodations and employment discrimination; the Voting Rights Act (1965) supplied enforcement machinery that raised Black registration in Mississippi from under 7% to over 50% within years; and the Fair Housing Act (1968) addressed housing discrimination in law. The limits were equally clear. The 1964 and 1965 Acts did not touch the wealth gap, school funding tied to segregated housing, or northern de facto segregation — as King discovered in the Chicago campaign of 1966, where tactics effective against southern statutes failed against entrenched housing and employment patterns. Poverty rates and school segregation outside the South barely moved, and the movement fractured after 1965 over exactly this question, as the Black Power critique argued that formal equality without economic power was insufficient. The fair assessment is therefore that the movement succeeded almost completely against *de jure* segregation and disenfranchisement, and that the *de facto* structures proved far more durable — which is why the period is a turning point rather than a conclusion.",
        hintSteps: [
          "'Assess how far' requires a judgement, not a narrative — decide your line before you start writing.",
          "Separate legal or *de jure* aims from economic and *de facto* ones; the answer differs sharply between them.",
          "Anchor each claim to a specific act, case or campaign with a date.",
          "Use the post-1965 fracture and the Chicago campaign as evidence of the limits, not merely as chronology."
        ],
        walkthroughSteps: [
          "State the thesis up front: near-complete success against legal segregation, limited success against economic inequality.",
          "Legal evidence in sequence: *Brown* 1954, Montgomery 1955–56, sit-ins and Freedom Rides, Birmingham 1963, Civil Rights Act 1964, Selma and the Voting Rights Act 1965, Fair Housing Act 1968.",
          "Quantify where you can — the Mississippi registration figures are the single most effective statistic here.",
          "Turn to limits: employment, wealth, and school segregation driven by housing rather than statute.",
          "Chicago 1966 is the pivotal example: the same tactics failed where the target was structural rather than legal.",
          "Explain the movement's fracture after 1965 as a consequence of that gap, not merely as division.",
          "Conclude by distinguishing *de jure* from *de facto* explicitly — that distinction is what a strong answer is graded on."
        ],
        tags: ["civil-rights", "assessment", "essay"]
      }
    ]
  }
];
