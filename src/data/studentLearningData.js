// Frontend data for the Skill Next LMS student portal.
// Lesson text lives in lessonContent.js and quiz questions in quizData.js.
// Replace these frontend course definitions with approved backend responses when APIs are ready.

import { courseContent } from "./lessonContent";

const technologyMeta = [
  {
    id: "react",
    name: "React",
    category: "Frontend Development",
    description: "Build interactive user interfaces with components, props, state and hooks.",
    level: "Beginner to Advanced",
    accent: "teal",
    reference: "https://www.w3schools.com/react/",
  },
  {
    id: "python",
    name: "Python",
    category: "Programming",
    description: "Learn Python syntax, data structures, functions and practical programming.",
    level: "Beginner to Advanced",
    accent: "gold",
    reference: "https://www.w3schools.com/python/",
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "Web Development",
    description: "Understand modern JavaScript, asynchronous programming and browser APIs.",
    level: "Beginner to Advanced",
    accent: "gold",
    reference: "https://www.w3schools.com/js/",
  },
  {
    id: "java",
    name: "Java",
    category: "Programming",
    description: "Explore object-oriented programming, collections and core Java concepts.",
    level: "Beginner to Advanced",
    accent: "teal",
    reference: "https://www.w3schools.com/java/",
  },
  {
    id: "sql",
    name: "SQL",
    category: "Database",
    description: "Query and manage relational data using practical SQL statements.",
    level: "Beginner to Intermediate",
    accent: "teal",
    reference: "https://www.w3schools.com/sql/",
  },
  {
    id: "html-css",
    name: "HTML & CSS",
    category: "Web Design",
    description: "Structure web pages and create responsive layouts with modern CSS.",
    level: "Beginner",
    accent: "gold",
    reference: "https://www.w3schools.com/html/",
  },
];

// topic.lessons      -> lesson titles used for navigation and progress
// topic.lessonItems  -> full lesson objects containing text, points, code and output
export const technologies = technologyMeta.map((meta) => {
  const topics = (courseContent[meta.id] || []).map((topic) => ({
    id: topic.id,
    title: topic.title,
    summary: topic.summary,
    tip: topic.tip,
    lessons: (topic.lessons || []).map((lesson) => lesson.title),
    lessonItems: topic.lessons || [],
  }));

  return {
    ...meta,
    topics,
    lessons: topics.reduce((total, topic) => total + topic.lessons.length, 0),
  };
});

// Main course categories shown on Explore Topics. All course, module and lesson
// copy is kept here so the UI components only render data and navigation.
// Each vocational module also includes a realistic guided activity and a
// professional checklist so the lesson page has practical detail beyond theory.
const moduleEnrichment = {
  "hair-scalp-fundamentals": {
    guidedPractice: "Use a training mannequin or a supervised consultation scenario. Record the visible hair characteristics, then describe texture, density, porosity and elasticity separately. Note any visible scalp concern without diagnosing it. Based on the observations, explain which routine care options may be suitable and identify when the service should be paused for professional advice.",
    professionalChecklist: ["Ask permission before examining or handling the client's hair and scalp.", "Record hair characteristics separately instead of treating texture, density and porosity as the same thing.", "Use neutral language when describing visible scalp observations; do not diagnose a skin or medical condition.", "Select care products according to the hair assessment, client goal and product directions.", "Refer unusual, painful or persistent scalp concerns to an appropriate healthcare professional."],
  },
  "tools-hygiene": {
    guidedPractice: "Prepare a salon trolley for a simulated haircut. Arrange combs, brushes, clips, scissors, towels and products so that clean items remain separate from used items. Identify which implements are single-use, which must be cleaned, and which require disinfection under the salon procedure. Finish by checking electrical leads and placing heated tools on a stable heat-resistant surface.",
    professionalChecklist: ["Clean visible soil from reusable tools before disinfection.", "Follow the disinfectant label for dilution, surface compatibility and contact time.", "Use fresh towels and capes for each client and discard single-use items after use.", "Keep electrical appliances and plugs dry, and remove damaged equipment from service.", "Store sharp, chemical and heated tools in designated safe locations."],
  },
  "basic-haircutting": {
    guidedPractice: "On a mannequin, plan a simple one-length or layered shape before cutting. Mark the agreed perimeter, divide the hair into controlled sections, create a guide and work methodically from one section to the next. Pause regularly to compare both sides, check the outline from different angles and make small refinements rather than removing large amounts of hair at once.",
    professionalChecklist: ["Confirm the desired length, shape and maintenance expectations before cutting.", "Drape the client and detangle the hair before creating clean sections.", "Maintain a visible guide and consistent tension for the chosen technique.", "Keep fingers and the cutting edge positioned safely and maintain controlled body posture.", "Cross-check balance, outline and overall shape before finishing."],
  },
  "styling-techniques": {
    guidedPractice: "Create a simple blow-dry and finished-style plan for a mannequin. Identify the desired finish, choose suitable preparation products, divide the hair into manageable sections and select an appropriate brush and dryer attachment. Practise controlled airflow and brush tension, then use a curling or setting tool only at a suitable temperature. Allow the hair to cool before loosening and finishing the style.",
    professionalChecklist: ["Choose products and tools based on the hair condition and requested finish.", "Use manageable sections so airflow and tool movement remain controlled.", "Keep hot tools moving and avoid prolonged heat on one section.", "Use heat protection where recommended by the product directions.", "Allow curls or sets to cool before brushing, separating or applying finishing products."],
  },
  "colouring-treatments": {
    guidedPractice: "Work through a simulated colour consultation without applying chemicals to a client. Record the previous colour and chemical-service history, clarify the target result and identify the tests required by the selected manufacturer's instructions and salon policy. Practise reading the product directions, locating the mixing ratio and processing guidance, and writing a clear after-care explanation.",
    professionalChecklist: ["Record previous colour, lightening, straightening and other relevant chemical-service history.", "Complete the patch and strand tests required by the product manufacturer and local salon policy.", "Use only the specified product combination, mixing ratio and processing time.", "Protect the client, work area and clothing, and follow product ventilation and handling directions.", "Do not proceed when a required test, safety check or suitability condition has not been met."],
  },
  "client-consultation": {
    guidedPractice: "Role-play a consultation for a client requesting a change in length, style or colour. Ask open questions, listen for the client's priorities and confirm the agreed result in plain language. Explain maintenance, limitations, price and after-care, then complete a concise service record and check that the client has agreed before beginning.",
    professionalChecklist: ["Use open questions and active listening to understand the client's goal.", "Confirm the agreed service, expected result, price and maintenance needs before starting.", "Explain relevant limitations and alternatives honestly rather than promising an unrealistic result.", "Obtain consent and maintain privacy and professional boundaries.", "Provide clear after-care advice and record relevant service details securely."],
  },
  "welding-safety": {
    guidedPractice: "In an instructor-led workshop briefing, identify the welding area boundaries, screens, extraction points, emergency stops and fire equipment. Review the task risk assessment and the required PPE for the specific process. Practise the pre-start inspection on a de-energised training setup and explain what action to take if ventilation, cables, PPE or fire controls are not satisfactory.",
    professionalChecklist: ["Use the task risk assessment and workshop instructions before starting work.", "Wear process-appropriate eye, face, hand, body and foot protection.", "Use suitable local exhaust ventilation and follow workshop fume-control procedures.", "Keep combustible materials controlled and apply the required fire-watch arrangements.", "Stop and report damaged equipment, poor ventilation or unsafe working conditions."],
  },
  "welding-tools": {
    guidedPractice: "With the power source isolated and under supervision, identify the power source, electrode holder or torch, return lead, cables, connectors and shielding-gas equipment used by the selected process. Inspect the equipment for visible wear, verify that consumables match the approved welding procedure and explain the safe shutdown sequence.",
    professionalChecklist: ["Inspect cables, connectors, torch or holder and return lead before use.", "Confirm that the machine, consumables and accessories match the approved procedure.", "Secure gas cylinders upright and handle regulators and hoses according to workshop rules.", "Keep connections dry, protected and clear of hot work and sharp edges.", "Isolate the equipment and close gas supplies using the approved shutdown procedure."],
  },
  "smaw-arc": {
    guidedPractice: "On a supervised practice coupon, review the approved welding procedure before selecting the electrode and machine settings. Practise preparing the joint, establishing a controlled arc, maintaining a consistent arc length and travel angle, and cleaning slag between passes. Ask an instructor to review bead shape and visible defects before changing parameters.",
    professionalChecklist: ["Use the electrode type, polarity and parameters specified by the approved procedure.", "Prepare and fit up the joint so the parts remain correctly aligned.", "Maintain a controlled arc length, electrode angle and travel speed.", "Remove slag and inspect each pass before depositing the next pass.", "Allow the workpiece to cool safely and report visible defects for review."],
  },
  "mig-welding": {
    guidedPractice: "In a supervised training bay, identify the wire type and diameter, feed-roll arrangement, contact tip, nozzle and shielding-gas supply. Review the procedure for the material and joint, then practise maintaining a steady torch angle, stick-out and travel speed on a training plate. Compare the completed bead with the instructor's quality criteria.",
    professionalChecklist: ["Verify wire, gas, polarity and machine settings against the approved procedure.", "Check the wire path, feed rolls, contact tip and torch nozzle before welding.", "Keep the shielding-gas nozzle clear and protect the weld area from drafts.", "Maintain a consistent torch angle, travel speed and contact-tip-to-work distance as trained.", "Inspect the bead and stop to correct feed, gas or equipment issues rather than continuing with a faulty setup."],
  },
  "tig-welding": {
    guidedPractice: "Under instructor supervision, identify the torch, tungsten electrode, collet, gas cup, shielding-gas supply and filler material. Practise preparing a clean training coupon, maintaining torch distance and shielding coverage, and coordinating torch movement with filler addition. Focus on control and cleanliness before attempting a more complex joint.",
    professionalChecklist: ["Select tungsten, cup, filler and shielding gas according to the approved procedure.", "Keep the base material, filler and gloves clean to reduce contamination.", "Maintain suitable shielding coverage and avoid touching the tungsten to the molten pool.", "Coordinate torch travel and filler addition smoothly under instructor guidance.", "Follow the required post-flow, hot-electrode handling and safe shutdown steps."],
  },
  "joints-inspection": {
    guidedPractice: "Review a set of training weld samples and identify the joint type, weld location and visual features. Use a suitable inspection light and approved gauge under supervision to check dimensions and visible discontinuities. Record findings against the acceptance criteria supplied by the instructor and explain when a non-destructive test or qualified inspector is required.",
    professionalChecklist: ["Confirm the drawing, joint preparation and applicable acceptance criteria before inspection.", "Check weld appearance, dimensions, profile and visible discontinuities using the approved method.", "Use gauges and measuring tools only within their intended range and correct procedure.", "Record inspection results clearly and identify non-conforming work.", "Do not accept or repair a weld outside your authority; refer it to the responsible inspector or supervisor."],
  },
  "cnc-fundamentals": {
    guidedPractice: "Use a training simulator or instructor-approved setup sheet to identify machine axes, the control panel, workholding, tool positions and work coordinates. Trace the preparation sequence from drawing and job sheet review through tool and offset checks to simulation or prove-out. Explain which checks must be completed before automatic operation begins.",
    professionalChecklist: ["Confirm the current drawing revision, job sheet and approved CNC program.", "Inspect the workholding and ensure the component is secured with suitable tool clearance.", "Verify tool data, tool offsets, work offsets and machine reference positions.", "Use the approved simulation, single-block or prove-out procedure before production.", "Keep guards and interlocks in place and never reach into a moving machine enclosure."],
  },
  "engineering-drawings": {
    guidedPractice: "Choose a training component drawing and identify its front, top and side views. Find the nominal dimensions, units, tolerances, surface notes and revision information. Select a suitable measuring instrument for two features, check its zero and condition, then record sample measurements and compare them with the permitted tolerance range.",
    professionalChecklist: ["Check the drawing number, revision and units before interpreting dimensions.", "Read orthographic views, section views, notes and symbols together.", "Understand the nominal size and the permitted tolerance for each critical feature.", "Select an instrument with suitable range and resolution and verify its zero.", "Record measurements with units and report any result outside the specified tolerance."],
  },
  "cnc-lathe": {
    guidedPractice: "On a simulator or under instructor supervision, identify the chuck, workpiece, cutting tool, turret and machine axes. Review the setup sheet, check the workholding and tool clearance, and trace the programmed facing and turning sequence. Use a simulation or approved prove-out to observe the path before any physical machine cycle.",
    professionalChecklist: ["Secure the workpiece using the approved chuck, collet or fixture procedure.", "Verify tool geometry, tool offsets, work zero and clearance from the chuck and jaws.", "Confirm spindle speed, feed and depth of cut from the approved process data.", "Keep the enclosure closed during operation and use the approved prove-out method.", "Stop the machine before measuring, clearing chips or making an adjustment."],
  },
  "cnc-milling": {
    guidedPractice: "Use a training part drawing to identify the faces, slots, pockets or holes to be machined. Select a suitable cutter from the approved tool list, plan the workholding and review the toolpath around clamps and fixture edges. Simulate the operation and identify where the tool enters, exits and changes direction before running it on a machine.",
    professionalChecklist: ["Choose a cutter suitable for the material, feature geometry and required finish.", "Secure the component without distorting it and confirm the fixture is stable.", "Verify tool length, work offsets, spindle and feed data from the approved setup.", "Check the complete toolpath for clamp, fixture and enclosure clearance.", "Stop the machine before removing chips, measuring the part or changing tools."],
  },
  "g-code": {
    guidedPractice: "Review a short controller-specific sample program with an instructor. Identify the program start, units, coordinate system, tool call, spindle and coolant commands, feed values, motion blocks and safe return. Trace the path in a simulator and explain which commands are modal and why the machine manual must be checked before using unfamiliar codes.",
    professionalChecklist: ["Confirm the controller type and consult its programming manual.", "Check units, plane, work coordinate system and tool offsets before motion begins.", "Read motion, feed, speed and auxiliary commands in program order.", "Check safe start and return positions and confirm the toolpath in simulation.", "Never run an unverified or modified program directly on a production machine."],
  },
  "tooling-quality": {
    guidedPractice: "Inspect sample cutting tools and identify visible wear, chipping or damage. Review a component drawing and choose suitable instruments for the specified critical features. Record a small set of sample measurements, compare the values with the tolerances and practise documenting a non-conformance instead of altering the result to make it appear acceptable.",
    professionalChecklist: ["Inspect cutting edges, holders and tool seating before machining.", "Monitor wear, vibration, surface finish and dimensional drift during production.", "Use the inspection method and sampling frequency specified by the quality plan.", "Deburr safely and measure critical features with suitable calibrated instruments.", "Identify and segregate non-conforming parts and record the issue for review."],
  },
  "skin-anatomy": {
    guidedPractice: "Use a labelled skin diagram to identify the epidermis, dermis and subcutaneous tissue. For each layer, describe its broad role and one structure associated with it. Then compare a few non-medical skin-care scenarios and explain why an esthetics professional should observe and document visible features without diagnosing a disease.",
    professionalChecklist: ["Describe skin layers and functions using accurate basic terminology.", "Recognise that skin characteristics can vary across areas and over time.", "Use skin-type descriptions to guide cosmetic care, not to make a medical diagnosis.", "Avoid treatment when the observed condition falls outside training or salon policy.", "Refer persistent, painful or unusual skin concerns to a qualified healthcare professional."],
  },
  "skin-analysis": {
    guidedPractice: "Role-play a pre-treatment consultation. Ask about the client's goals, current routine, sensitivities, allergies and recent treatments. Explain the proposed service and possible reactions, obtain consent and record relevant observations. Practise identifying a situation where the correct professional decision is to postpone the service and refer the client for appropriate advice.",
    professionalChecklist: ["Ask only relevant consultation questions and explain why the information is needed.", "Observe the skin under suitable lighting and document visible features neutrally.", "Check contraindications, product warnings and salon service policies.", "Explain the service, likely sensations, possible reactions and after-care before consent.", "Store client records securely and maintain confidentiality."],
  },
  "facial-treatments": {
    guidedPractice: "On a mannequin or in a supervised training demonstration, arrange the products and clean tools for a basic facial sequence. Explain the purpose of preparation, cleansing, skin observation, any suitable exfoliation or mask, moisturising and sun protection. For each step, identify how the client's consultation and skin tolerance affect whether the step is included or omitted.",
    professionalChecklist: ["Confirm suitability and client consent before beginning the facial.", "Prepare clean linens, tools and products and maintain hand hygiene.", "Use only products suitable for the client's skin and the planned service.", "Avoid unnecessary pressure, friction or products on areas that are unsuitable for treatment.", "Explain post-treatment care and advise when the client should seek professional medical guidance."],
  },
  "hair-removal": {
    guidedPractice: "In a supervised simulation, review a client's suitability for a basic hair-removal service and identify the required preparation. Practise arranging clean applicators and single-use supplies, checking product temperature using the approved method, and demonstrating how skin support and application direction are taught in the salon procedure. Finish with a clear after-care explanation.",
    professionalChecklist: ["Check client suitability, contraindications and product-specific instructions before treatment.", "Prepare the skin and work area hygienically and use a fresh applicator as required.", "Check product temperature with the approved method to reduce burn risk.", "Follow the trained application and removal technique and avoid unsuitable or irritated skin.", "Explain expected temporary skin responses and after-care, and record any adverse reaction."],
  },
  "makeup-fundamentals": {
    guidedPractice: "Create a simple makeup plan for a training model or face chart. Identify the intended finish, consider skin tone and texture, plan the order of application and choose suitable tools. Practise dispensing products without contaminating containers, cleaning brushes between models and explaining how the client can remove the makeup gently at the end of the service.",
    professionalChecklist: ["Discuss the desired look, sensitivities and product preferences before application.", "Use clean brushes and sanitised tools and avoid double-dipping into shared products.", "Choose shades and textures to suit the intended look and the client's skin characteristics.", "Keep products away from the eye or lip area when contamination has occurred.", "Explain removal and basic after-care and clean tools after the service."],
  },
  "esthetics-hygiene": {
    guidedPractice: "Prepare a treatment room using the salon's cleaning schedule. Identify high-touch surfaces, reusable implements, single-use supplies, clean linens and waste containers. Demonstrate the difference between cleaning and disinfection, read the product contact-time instructions and explain how client privacy, draping, consent and incident reporting are handled during a service.",
    professionalChecklist: ["Perform hand hygiene at the required moments and use fresh linens for each client.", "Clean visible soil before disinfecting reusable surfaces and equipment.", "Follow the product label for dilution, contact time and safe handling.", "Separate clean supplies, used tools and waste to prevent cross-contamination.", "Protect privacy, obtain consent and report incidents using the salon procedure."],
  },
  "pos-fundamentals": {
    guidedPractice: "Use a training POS terminal or a simulated screen to identify the cashier login, sales screen, product lookup, payment area, receipt function and shift controls. Walk through a shift-opening checklist and describe how the cashier should respond if the receipt printer, barcode scanner or network connection is unavailable.",
    professionalChecklist: ["Use an individual authorised login and never share credentials.", "Check the terminal, scanner, receipt printer, cash drawer and payment device at shift opening.", "Follow the configured transaction sequence and verify that sales are completed.", "Use the store-approved fallback procedure for equipment or network failures.", "Log out or secure the terminal when leaving the workstation."],
  },
  "product-inventory": {
    guidedPractice: "Create sample product records with a name, SKU, barcode, category, price and tax setting in a training environment. Compare a mock delivery note with received quantities, record a discrepancy and practise an authorised stock adjustment with a clear reason. Explain why product and stock records must remain traceable.",
    professionalChecklist: ["Check the product name, SKU, barcode, category and price for accuracy.", "Verify received quantities against the delivery or purchase document.", "Inspect damaged or missing items and record discrepancies before stock is accepted.", "Make stock adjustments only with the required authorisation and reason.", "Keep inventory records up to date so checkout and reports use correct data."],
  },
  "billing-checkout": {
    guidedPractice: "Process a simulated basket containing several products and quantities. Confirm each scanned or selected item, review the cart, check configured discounts and taxes, and verify the amount due before selecting a test payment method. Finish by checking that the training transaction is marked complete and that the receipt matches the basket.",
    professionalChecklist: ["Confirm each item description and quantity before payment.", "Review the cart, applicable discounts, taxes and final total with the customer.", "Select the payment method actually used and wait for confirmation.", "Do not issue a final receipt or mark a sale paid while payment is pending or declined.", "Check that the receipt and transaction record match the completed sale."],
  },
  "payments-taxes": {
    guidedPractice: "Use training transactions to compare cash, card and approved digital payment flows. Practise a split-payment scenario and confirm that the combined tender equals the amount due. Review sample receipts to identify the configured tax and discount lines, and explain why a cashier must not change tax settings or invent a discount without authorisation.",
    professionalChecklist: ["Use only payment types enabled and approved by the business.", "Wait for the payment terminal or provider to confirm a successful transaction.", "For split payments, verify that the combined amounts equal the total due.", "Apply tax and discount settings exactly as configured and authorised.", "Escalate duplicate, reversed, declined or uncertain transactions through the approved process."],
  },
  "returns-refunds": {
    guidedPractice: "Review a simulated return request with an original receipt, purchase date and item condition. Compare the request with a sample store policy, decide whether it is eligible and identify any approval required. Practise selecting the correct return or exchange action in a training POS and recording the reason so inventory and transaction records remain accurate.",
    professionalChecklist: ["Check the original transaction and the current return policy before proceeding.", "Inspect the item and confirm the request meets the stated eligibility rules.", "Use the correct return, exchange or refund action in the POS.", "Obtain approval for exceptions and use the refund method required by policy.", "Record the reason and confirm the inventory and payment records are updated."],
  },
  "pos-reports": {
    guidedPractice: "Use a sample end-of-day report and opening cash float to calculate the expected drawer balance. Compare that figure with a mock physical cash count and identify any difference. Practise recording the variance and reviewing payment totals, refunds and terminal settlement status without changing the underlying figures to force a match.",
    professionalChecklist: ["Review gross sales, discounts, taxes, refunds and payment totals in the daily report.", "Calculate expected cash using the opening float and recorded cash movements.", "Count physical cash using the store's verification or dual-control procedure.", "Investigate and document differences instead of changing totals to force a match.", "Complete terminal settlement and submit reports through the approved process."],
  },
};

const buildLessonSections = (foundation, workflow, scenario, qualityChecks) => [
  { title: "Understand the foundations", paragraphs: foundation },
  { title: "Step-by-step working method", steps: workflow },
  { title: "Apply the knowledge in practice", paragraphs: scenario },
  { title: "Quality checks and common mistakes", bullets: qualityChecks },
];

// Detailed teaching content for vocational modules only. IT course content is
// sourced from lessonContent.js and is intentionally not changed here.
const vocationalLessonDetails = {
  "hair-scalp-fundamentals": buildLessonSections(
    [
      "Hair is a fibre produced inside a follicle in the skin. The part visible above the skin is the hair shaft; the root sits inside the follicle. The shaft is commonly described in three layers: the cuticle on the outside, the cortex beneath it and, in some hair, a central medulla. The cuticle consists of overlapping cells that protect the inner structure. The cortex contributes much of the hair's strength, colour and shape. Understanding these parts helps explain why rough handling, excessive heat and unsuitable chemical services can weaken hair.",
      "Assess each characteristic separately. Texture refers to the diameter or feel of an individual strand; density refers to how much hair grows over an area; porosity describes how readily the hair takes in and releases moisture or products; elasticity describes how far it stretches and returns. Curl pattern, length, previous services and the client's usual routine also affect service planning. These observations are not a medical diagnosis. If the scalp is painful, inflamed, broken or unusually irritated, pause and follow the salon's referral procedure."
    ],
    [
      { title: "Consult before touching", detail: "Ask the client's permission, clarify the service goal and ask about recent chemical services, allergies or sensitivities according to salon policy." },
      { title: "Observe the hair", detail: "Look at the roots, mid-lengths and ends. Note strand texture, density, curl pattern, visible dryness, breakage and previous colour or chemical work." },
      { title: "Assess condition gently", detail: "Use a small, gentle observation of elasticity and porosity only where appropriate. Do not pull strongly, scrape the scalp or make a diagnosis." },
      { title: "Match the service", detail: "Choose a suitable cleansing, conditioning, styling or treatment plan based on the observations, the client's goal and the product directions." },
      { title: "Explain and record", detail: "Describe what you observed in plain language, confirm the agreed plan and record relevant details securely." }
    ],
    [
      "A client asks for a lightened colour service but has dry ends and a history of previous colouring. A professional stylist does not promise a result immediately. The stylist records the service history, assesses the hair condition, explains that the result may need more than one appointment and follows the selected product's required tests and salon approval process before deciding whether the service is suitable.",
      "A second client has a visibly irritated scalp. The correct response is not to guess the cause or cover the area with a cosmetic product. Pause the planned service, explain the concern respectfully and follow the salon's referral guidance."
    ],
    [
      "Do not confuse strand thickness with the amount of hair on the head; texture and density are different observations.",
      "Do not assume that every scalp concern can be treated in a salon. Stay within the role and referral policy.",
      "Do not select a chemical service only from a photograph or a client's requested shade; assess history and condition.",
      "Use neutral descriptions, obtain consent and explain the reason for any service limitation."
    ]
  ),
  "tools-hygiene": buildLessonSections(
    [
      "Salon tools are selected according to the task. Combs separate and control sections; brushes detangle, smooth or create tension; clips hold hair out of the working area; scissors cut; dryers and heated tools shape the hair. Products also have different roles: cleansing products remove residue, conditioners improve manageability, styling products support hold or finish, and chemical products change the hair structure or colour. Product choice must follow the hair assessment and the manufacturer's instructions rather than guesswork.",
      "Hygiene is a sequence, not a single action. Cleaning removes visible hair, dust and product residue. Disinfection is then performed on suitable reusable implements using an approved product and its stated dilution and contact time. Some items are single-use and must be discarded after one client. Local rules and salon policy determine which items require additional processing. Clean supplies must remain separate from used tools, towels and waste."
    ],
    [
      { title: "Prepare the workstation", detail: "Disinfect the work surface as required, arrange clean towels and capes, check the chair and place only the tools needed for the planned service." },
      { title: "Inspect tools and appliances", detail: "Check scissors, combs, brush pins, dryer casing, plugs and cords. Remove damaged or unsafe equipment from service and report it." },
      { title: "Separate clean and used items", detail: "Use clearly separated containers or trays. Never place a used implement back with clean tools." },
      { title: "Clean and disinfect correctly", detail: "Remove visible debris first. Follow the disinfectant label for compatibility, dilution, application and full contact time." },
      { title: "Store safely", detail: "Allow tools to dry as required, store sharp implements securely, switch off heated appliances and keep electrical items away from water." }
    ],
    [
      "Before a haircut, arrange a clean comb, sectioning clips, scissors, a brush and fresh protective linen. Keep a separate container ready for used tools. After the service, remove hair and visible residue, clean and disinfect reusable implements according to the product label, and replace the towel and cape before the next client.",
      "If a dryer has a damaged cable or the plug becomes unusually hot, do not tape it temporarily or continue using it. Switch it off safely, remove it from use and report it for inspection or replacement."
    ],
    [
      "Cleaning and disinfection are not interchangeable; visible soil must be removed before the appropriate disinfection step.",
      "Do not shorten the disinfectant contact time or mix cleaning chemicals unless the label explicitly permits it.",
      "Never reuse disposable items or share applicators in a way that can transfer contamination.",
      "Keep liquids away from electrical connections and store hot tools on a suitable heat-resistant surface."
    ]
  ),
  "basic-haircutting": buildLessonSections(
    [
      "A haircut is a controlled change to length, shape and weight. The final result is influenced by the cutting line, elevation, over-direction, tension, finger angle and the position of the stylist. A one-length shape generally keeps the perimeter at a consistent level; layered shapes distribute weight differently and can create movement. These are design principles rather than a substitute for supervised practice. The stylist should understand the requested result before choosing a technique.",
      "Sectioning creates a repeatable working plan. A guide is a small section of hair whose length or position is used to compare the next section. Elevation means lifting hair away from its natural fall; changing elevation changes where weight remains. Over-direction means moving hair away from where it naturally falls before cutting. Consistent body position and tension make the result easier to control and compare."
    ],
    [
      { title: "Agree the design", detail: "Discuss the perimeter, overall shape, fringe or face-framing details, maintenance and how much length the client is comfortable removing." },
      { title: "Prepare and section", detail: "Drape the client, detangle without pulling and divide the hair into clean, balanced sections using clips." },
      { title: "Create the guide", detail: "Establish the first guide according to the planned haircut and keep it visible as you move through the sections." },
      { title: "Work in controlled subsections", detail: "Take manageable sections, maintain consistent tension and use the intended finger angle and elevation. Remove small amounts when refining." },
      { title: "Cross-check and finish", detail: "Compare corresponding sides, check the perimeter and overall balance from more than one view, then style and confirm the result with the client." }
    ],
    [
      "For a basic one-length training cut on a mannequin, first mark the agreed perimeter and create even sections. Establish a guide at the back and work methodically around the head, checking that each new subsection is compared with the guide. Before finishing, let the hair fall naturally and inspect the outline rather than judging it only while the hair is held under tension.",
      "If one side appears longer, identify whether the difference comes from uneven sectioning, posture, head position or inconsistent tension. Correct the cause with small controlled refinements instead of repeatedly cutting without a plan."
    ],
    [
      "Do not begin cutting before the client has agreed to the length and shape.",
      "Uneven section sizes, changing tension and losing the guide can produce an inconsistent result.",
      "Avoid cutting large amounts during the final refinement; check the natural fall first.",
      "Handle scissors safely, maintain a stable posture and practise unfamiliar techniques on mannequins under supervision."
    ]
  ),
  "styling-techniques": buildLessonSections(
    [
      "A finished style is built through preparation, section control, shaping and setting. The desired result determines the tools and products: smooth finishes need controlled tension and airflow; volume needs suitable root direction and section placement; curls need a shape that is held while cooling; braids depend on even sections and consistent tension. Product quantity matters. Too much product can weigh hair down, leave residue or make the finish difficult to control.",
      "Heat changes the temporary shape of hair, but excessive temperature or prolonged contact can cause damage. Use the lowest effective heat setting suitable for the hair and tool, follow the manufacturer's guidance and apply heat protection where recommended. Keep dryers and heated tools moving, maintain a safe distance from the scalp and allow shaped sections to cool before brushing or separating them."
    ],
    [
      { title: "Define the finish", detail: "Confirm whether the client wants smoothness, volume, curl definition, a set style or a braided finish." },
      { title: "Prepare the hair", detail: "Cleanse or refresh as suitable, remove excess water, detangle gently and apply an appropriate amount of preparation product." },
      { title: "Create workable sections", detail: "Use clips to keep sections separate. Smaller sections give more control; larger sections may save time but can reduce consistency." },
      { title: "Shape with controlled tools", detail: "Use the correct brush, dryer attachment or styling tool. Maintain comfortable tension, keep heat moving and avoid repeated passes over the same area." },
      { title: "Cool and finish", detail: "Allow curls or sets to cool, release them gently, refine the shape and use finishing product sparingly." }
    ],
    [
      "For a smooth blow-dry on a mannequin, divide the hair into panels and work from the lower sections upwards. Keep the brush and airflow coordinated so the section is dried evenly. Direct the airflow along the hair rather than holding the dryer stationary. Once a section is shaped, allow it to cool before moving it out of the way.",
      "For a curl set, form sections of similar size and use consistent placement. Releasing a hot curl immediately can make the finish lose its shape; cooling is part of the setting process, not wasted time."
    ],
    [
      "Do not apply high heat to wet hair or hold a hot tool in one place for too long.",
      "Avoid very large sections when the desired finish requires even tension and shape.",
      "Do not overload the hair with product; select it for the finish and follow the label.",
      "Check client comfort, tool temperature and electrical safety throughout the service."
    ]
  ),
  "colouring-treatments": buildLessonSections(
    [
      "Hair colour products work through different formulation systems. Temporary products mainly coat the surface; semi-permanent and demi-permanent systems deposit colour in different ways; permanent colour systems are designed for longer-lasting colour change. Lightening products remove some natural or artificial pigment and can place greater stress on the hair. The exact result depends on the starting level, underlying pigment, previous colour, product system and hair condition.",
      "Colour planning should include a clear target, realistic expectations, the product's instructions and any required patch or strand tests. A patch test and a strand test answer different questions: follow the manufacturer's directions and salon policy for both where required. Mixing ratios, processing times, developer selection and application order are product-specific. Never substitute a remembered ratio or combine products that are not approved to be used together."
    ],
    [
      { title: "Record the colour history", detail: "Ask about previous colour, lightening, straightening, relaxers, henna or other products that may affect compatibility. Record the information clearly." },
      { title: "Agree a realistic target", detail: "Discuss the desired shade, starting point, maintenance, time and possible limitations. Explain when a staged service may be safer or more realistic." },
      { title: "Complete required tests", detail: "Carry out patch and strand tests exactly as directed by the manufacturer and salon policy, within the specified time window." },
      { title: "Prepare and apply", detail: "Use only the specified products, tools, mixing ratio and protective measures. Follow the application and processing instructions without improvisation." },
      { title: "Rinse, assess and advise", detail: "Complete the rinse and finishing steps in the product directions, assess the result and explain colour-safe after-care and maintenance." }
    ],
    [
      "A client wants a major colour change after several previous services. The stylist first collects the complete service history and performs the required tests. If the strand test shows a result or condition that is unsuitable, the stylist explains alternatives rather than proceeding simply because an appointment was booked.",
      "If a client reports discomfort during a chemical service, stop and follow the product and salon emergency instructions. Do not dismiss the concern or continue processing to reach a target shade."
    ],
    [
      "Never skip a required patch test, strand test or compatibility check.",
      "Do not invent mixing ratios, processing times or product combinations; use the exact manufacturer instructions.",
      "Do not promise that a photograph can be reproduced exactly on every starting hair colour.",
      "Pause when the scalp is irritated, the product reaction is unexpected or the test result is unsuitable."
    ]
  ),
  "client-consultation": buildLessonSections(
    [
      "A consultation is a structured conversation that turns a client's idea into an agreed service plan. It should establish what the client wants, what they currently do, what has been done to the hair before, how much time they can spend on maintenance and what result is realistic. Open questions invite useful detail; closed questions confirm specific facts. Listening and summarising help prevent misunderstandings.",
      "The service plan should cover the technique or service, expected result, limitations, cost, timing, after-care and any tests or approvals required. Consent must be informed and voluntary. Client notes should be factual, relevant and stored according to privacy rules. During the service, check comfort and explain meaningful changes before making them."
    ],
    [
      { title: "Welcome and understand", detail: "Introduce the consultation, ask what the client would like to achieve and invite them to describe their routine and preferences." },
      { title: "Explore suitability", detail: "Ask about previous services, sensitivities and relevant history using the salon's approved questions. Refer concerns outside your role." },
      { title: "Agree the plan", detail: "Explain the proposed service, alternatives, likely result, time, price, maintenance and any limitations in plain language." },
      { title: "Confirm consent and record", detail: "Check the client understands and agrees before starting. Record only necessary information and keep it confidential." },
      { title: "Review and advise", detail: "Check comfort during the service, show the result, explain after-care and confirm any recommended follow-up." }
    ],
    [
      "A client asks for a very short style but repeatedly describes wanting to tie the hair back. The stylist clarifies the priority, explains the practical effect of the requested length and agrees on a shape that meets the client's main need. This avoids relying on an unclear reference photograph.",
      "If the client changes their mind after seeing the plan, pause and discuss the change, time and cost before continuing. Do not treat earlier consent as approval for a different service."
    ],
    [
      "Avoid technical jargon without explanation; ask the client to confirm the plan in their own words.",
      "Do not promise an outcome that depends on unknown hair history or an uncompleted test.",
      "Never share client photographs or personal notes without the required permission.",
      "Record changes to the agreed service and obtain consent before proceeding."
    ]
  ),

  "welding-safety": buildLessonSections(
    [
      "Welding combines several hazards at the same time: arc radiation, hot metal, sparks, fumes, noise, electrical energy, compressed gas and fire risk. A safe job starts with a task-specific risk assessment and the workshop's hot-work authorisation. PPE is the last layer of protection; it does not replace screens, extraction, safe work layout, equipment inspection or supervision. Only trained and authorised people should operate the process.",
      "A welding helmet needs a suitable filter for the process and current range selected under the applicable guidance. Safety glasses, gloves, flame-resistant clothing, suitable footwear and hearing protection may also be required. Fume controls must be appropriate to the material and process. Coatings, galvanised materials and unknown residues can create additional hazards, so the material must be identified and the approved procedure followed before work begins."
    ],
    [
      { title: "Review the job and authorisation", detail: "Identify the material, process, location and nearby people. Read the risk assessment, permit or hot-work instructions and confirm that you are trained for the task." },
      { title: "Prepare the area", detail: "Control combustibles, screens and access. Confirm suitable extraction, fire equipment, emergency access and any required fire-watch arrangements." },
      { title: "Check PPE and equipment", detail: "Inspect helmet, filter, gloves, clothing, footwear, leads and connections. Replace damaged items and report any defect." },
      { title: "Work within the approved procedure", detail: "Maintain ventilation, screens and safe body position. Stop if conditions change or controls are no longer effective." },
      { title: "Shut down and inspect", detail: "Isolate equipment as instructed, manage hot material, check the work area for smouldering material and complete the required handover." }
    ],
    [
      "Before a practice weld, a learner notices that the extraction arm is not operating and nearby combustible packaging has not been removed. The correct decision is to stop and notify the instructor or supervisor. Wearing a helmet does not make those missing controls acceptable.",
      "A cylinder, vessel or previously used container must never be welded merely because it appears empty. Its history and contents must be known and an approved specialist procedure must be in place."
    ],
    [
      "Do not weld without the required authorisation, training, ventilation and fire controls.",
      "Never look at an arc without suitable eye protection or rely on another person's helmet to protect you.",
      "Keep gas cylinders secured and away from impact, heat and unauthorised handling.",
      "Stop work immediately when a cable, regulator, ventilation system or protective control is defective."
    ]
  ),
  "welding-tools": buildLessonSections(
    [
      "A welding station is assembled from components that must match the process and approved welding procedure. The power source controls the electrical output; leads carry current; the work-return connection completes the circuit; a holder or torch delivers the electrode or wire; and process-specific gas equipment may provide shielding. Consumables include electrodes, wire and filler material. The correct selection depends on the base metal, joint, position, thickness and procedure.",
      "Polarity, current, voltage, wire-feed speed and gas flow are not settings to guess. They depend on the machine, consumable and procedure. The machine manual and qualified welding procedure are the authority. A pre-use inspection checks insulation, connectors, torch condition, hoses, regulators, cylinder security, cooling and protective devices. Any damage or abnormal behaviour must be reported before energising the setup."
    ],
    [
      { title: "Identify the process", detail: "Confirm whether the task uses SMAW, GMAW/MIG, GTAW/TIG or another process, then identify the equipment specified for it." },
      { title: "Check component compatibility", detail: "Match the power source, torch or holder, electrode or wire, filler and shielding arrangement to the approved procedure." },
      { title: "Inspect the equipment", detail: "Look for damaged insulation, loose connectors, worn torch parts, leaking hoses and regulator defects. Do not use defective equipment." },
      { title: "Prepare consumables and gas", detail: "Check identification and condition. Store consumables as specified and secure cylinders upright with suitable valve protection." },
      { title: "Set up under supervision", detail: "Use machine documentation and the approved procedure for settings. Verify connections and protective controls before starting." }
    ],
    [
      "A learner is preparing a MIG station but finds a wire spool whose classification is not listed in the procedure. The learner should not substitute it because the diameter looks similar. The supervisor must confirm the correct consumable and settings.",
      "A damaged torch cable or leaking gas hose is a stop-work condition. Temporary tape or an improvised connection is not a suitable repair."
    ],
    [
      "Do not choose polarity or machine settings from memory; verify them in the approved procedure.",
      "Do not use unidentified, damp, damaged or incompatible consumables.",
      "Keep cylinders upright, secured and handled using approved cylinder procedures.",
      "Do not energise a setup until the return connection, cables and protective checks are confirmed."
    ]
  ),
  "smaw-arc": buildLessonSections(
    [
      "Shielded Metal Arc Welding uses a consumable electrode with a flux coating. An electric arc forms between the electrode tip and the workpiece. The arc melts the base metal and electrode to create a weld pool; the coating produces shielding gases and a layer of slag. As the weld cools, the slag covers the bead and helps protect it. The coating also influences arc characteristics and weld-metal properties, which is why electrode selection must follow the job procedure.",
      "A consistent bead depends on several linked controls: arc length, electrode angle, travel speed, current range and work position. If the arc is too long or unstable, spatter and bead irregularity may increase. If travel is too fast or too slow for the procedure, bead shape and fusion can be affected. The exact settings and acceptable bead dimensions must come from the approved procedure and instructor, not a generic rule."
    ],
    [
      { title: "Check the joint and electrode", detail: "Confirm base material, joint preparation, electrode classification, condition and position against the approved procedure." },
      { title: "Prepare and secure the work", detail: "Clean the joint as specified, position the parts and verify the return connection and safe clamping." },
      { title: "Set the machine", detail: "Use the required polarity and current range from the qualified procedure and machine guidance." },
      { title: "Practise controlled movement", detail: "Under supervision, maintain a consistent arc length, suitable electrode angle and steady travel along the joint." },
      { title: "Clean and inspect", detail: "Allow the weld to cool as directed, remove slag with suitable tools and inspect the bead before any additional pass." }
    ],
    [
      "During a supervised bead-on-plate exercise, the learner notices that the arc repeatedly extinguishes. Instead of increasing settings randomly, the learner pauses, checks the electrode condition and technique with the instructor, and verifies the machine setup against the procedure.",
      "After a pass, slag is removed before the next pass so that trapped slag does not become an avoidable discontinuity. The learner examines the bead for visible shape, continuity and surface irregularities."
    ],
    [
      "Do not use an electrode classification or condition that does not match the procedure.",
      "Avoid striking an arc before the work is clamped and the area is protected.",
      "Do not chip slag toward yourself or nearby people; use suitable eye and face protection.",
      "A visually neat bead alone does not prove weld acceptance; required inspection criteria still apply."
    ]
  ),
  "mig-welding": buildLessonSections(
    [
      "MIG is commonly used for gas metal arc welding with a continuously fed wire electrode and an external shielding gas. The wire is delivered through a drive system and contact tip while the torch guides the arc. Shielding gas protects the molten weld pool from atmospheric contamination. Different materials and transfer modes require different wire, gas and machine arrangements, so the selection must follow the approved procedure.",
      "The result depends on stable wire feeding, correct torch consumables, clean material, suitable work return and procedure-based settings. A blocked liner, worn drive roll, incorrect contact tip or poor gas delivery can interrupt the process. The operator should observe the arc and sound only as a supporting clue; inspection and procedure controls remain necessary."
    ],
    [
      { title: "Confirm wire and gas", detail: "Check that the wire classification, diameter and shielding gas match the work instruction and material." },
      { title: "Inspect the wire path", detail: "Check the spool, drive rolls, liner, contact tip and torch for wear, blockage or incorrect fit." },
      { title: "Prepare the joint", detail: "Clean and position the material, establish the work-return connection and verify the work area controls." },
      { title: "Verify settings", detail: "Set voltage, wire-feed and gas delivery only from the approved procedure and machine instructions." },
      { title: "Weld and review", detail: "Maintain the specified torch angle, stick-out and travel technique under supervision, then inspect the completed bead." }
    ],
    [
      "If a learner sees porosity or an irregular arc during practice, the correct response is to stop and investigate gas delivery, surface cleanliness, consumable condition and setup against the procedure. Increasing voltage without diagnosis may create another problem.",
      "A wire-feed problem should be traced through the spool, drive rolls, liner and contact tip. The learner isolates equipment before making any adjustment that requires access to moving or electrical parts."
    ],
    [
      "Do not substitute shielding gas or wire because the cylinder or spool is available.",
      "Keep the joint clean and protect the gas supply from drafts and leaks according to workshop rules.",
      "Do not touch or adjust moving wire-feed components while the machine is energised.",
      "Use the approved procedure for all settings and verify the bead through the required inspection process."
    ]
  ),
  "tig-welding": buildLessonSections(
    [
      "TIG, also called gas tungsten arc welding, uses a non-consumable tungsten electrode to create the arc. A shielding gas protects the weld area; filler metal may be added separately when the joint design requires it. Because the electrode is not intended to become the weld metal, torch control and cleanliness are especially important. Contamination of the tungsten or base material can affect arc stability and weld quality.",
      "TIG requires coordinated control of torch position, arc length, travel speed and filler addition. Some machines use a foot or hand control to adjust output during the weld. Current type and polarity depend on the material and procedure. Beginners should first practise torch handling and filler coordination on training material under supervision rather than attempting production work."
    ],
    [
      { title: "Prepare clean material", detail: "Remove contaminants using the approved cleaning method and keep prepared surfaces protected from oil, dust and fingerprints." },
      { title: "Check tungsten and torch", detail: "Use the tungsten type, preparation and torch components specified for the material and procedure. Keep the electrode uncontaminated." },
      { title: "Confirm shielding gas", detail: "Verify the specified gas, connections and flow arrangement using the approved setup instructions." },
      { title: "Practise coordination", detail: "Under supervision, maintain a controlled torch angle and arc length while coordinating filler addition and travel." },
      { title: "Inspect and protect", detail: "Review the weld surface and joint, identify contamination or irregularities and protect the work from damage before inspection." }
    ],
    [
      "During a training exercise, the tungsten accidentally touches the weld pool. The learner stops, isolates or follows the instructor's safe recovery instruction, and prepares or replaces the electrode as specified before restarting. Continuing with a contaminated electrode can make the arc unstable.",
      "A clean stainless-steel training coupon is prepared and handled with clean gloves or tools so that oils and shop residue do not transfer to the weld area."
    ],
    [
      "Do not use a contaminated or incorrectly prepared tungsten electrode.",
      "Do not touch the prepared joint with oily hands or dirty tools.",
      "Do not change gas, current type or polarity without checking the approved procedure.",
      "Maintain suitable ventilation and follow the process-specific eye, skin and electrical protection requirements."
    ]
  ),
  "joints-inspection": buildLessonSections(
    [
      "A weld joint is the arrangement of the parts being joined. Common joint forms include butt, lap, T, corner and edge joints. The joint design determines access, preparation, weld type and the way loads are transferred. Welding position describes how the joint is oriented while welding; position affects access, pool control and the procedure that may be used. The drawing and welding procedure define what joint and weld are required.",
      "Inspection checks whether the work meets the stated requirements. Visual inspection can identify surface features such as inconsistent profile, visible cracks, surface porosity, undercut or incomplete fill. Other methods may be required to identify internal conditions, depending on the application and governing standard. A learner should describe an observation accurately and refer acceptance decisions to the specified inspection criteria and authorised inspector."
    ],
    [
      { title: "Read the drawing and symbol", detail: "Identify the joint type, weld symbol, dimensions, location and any notes that define preparation or inspection." },
      { title: "Confirm fit-up", detail: "Check alignment, root opening, edge preparation and tack arrangement against the drawing and procedure." },
      { title: "Identify the position", detail: "Confirm the actual work orientation and make sure the welder and procedure are suitable for it." },
      { title: "Inspect the finished surface", detail: "After the required cleaning and cooling, examine the weld profile and surrounding material under suitable lighting." },
      { title: "Record and escalate", detail: "Document the location and type of any observed irregularity. Do not grind, repair or accept a weld without the authorised instruction." }
    ],
    [
      "A drawing specifies a fillet weld on a T-joint. Before welding, the learner checks that the parts meet at the intended angle and that the specified weld location is clear. After the weld, the learner compares the visible profile with the drawing and records any concern for the instructor.",
      "If a visible crack is observed, the learner does not hide it with another pass or assume it is harmless. The work is identified and referred for the required assessment and disposition."
    ],
    [
      "Do not infer acceptance from appearance alone; use the specified code, standard and inspection plan.",
      "Do not confuse a joint type with a welding position; they describe different things.",
      "Record the location and observation clearly instead of using vague comments such as 'bad weld'.",
      "Only authorised personnel should approve repairs or final acceptance."
    ]
  ),

  "cnc-fundamentals": buildLessonSections(
    [
      "A CNC machine moves a cutting tool or workpiece under computer control. Common machine elements include the structure, axes, spindle, toolholding system, workholding device, control panel, enclosure and coolant system. The machine coordinate system is established by the machine reference; a work coordinate system describes the part's chosen origin. Tool length and radius or diameter offsets compensate for the geometry of the tool. Understanding these references is essential before running a program.",
      "A CNC setup is a controlled sequence. The operator identifies the machine and workpiece, checks the drawing and program revision, secures the stock and tools, verifies offsets, and proves the program using the approved simulation or dry-run process. Machine controls vary by manufacturer. Homing, spindle direction, feed modes, offsets and safe start procedures must be learned from the machine manual and instructor."
    ],
    [
      { title: "Identify the machine and job", detail: "Check the machine type, part drawing, material, program number and revision. Confirm that the job is authorised for that machine." },
      { title: "Inspect and prepare", detail: "Check guarding, emergency stop, lubrication or coolant status and work area cleanliness before setup." },
      { title: "Secure work and tools", detail: "Use the specified fixture and toolholders. Confirm clamping and tool condition using the approved setup sheet." },
      { title: "Set references and offsets", detail: "Establish the work coordinate and tool offsets according to machine-specific training and documented setup instructions." },
      { title: "Prove before production", detail: "Verify the program revision, simulate or dry-run as directed, use single-block or reduced-risk proving modes where required, and keep the enclosure closed." }
    ],
    [
      "A first-off component is due on a training CNC mill. Before cycle start, the learner checks the drawing revision, stock size, fixture, tool list and coordinate origin. The program is verified in the approved simulator and the instructor confirms the setup before the machine is allowed to cut.",
      "If a tool or offset number does not match the setup sheet, the learner stops and resolves the mismatch rather than editing a value until the screen appears correct."
    ],
    [
      "Never bypass guards, interlocks or emergency-stop devices.",
      "Do not assume the machine origin and workpiece origin are the same.",
      "Do not run an unverified program or an unknown program revision on a machine.",
      "Keep hands outside the work envelope whenever the machine is energised or capable of movement."
    ]
  ),
  "engineering-drawings": buildLessonSections(
    [
      "An engineering drawing communicates the shape, size and requirements of a component. Orthographic views show the part from different directions; an isometric view can help visualise the three-dimensional form. Dimensions describe nominal size, while tolerances define the permitted variation. Datums provide reference features for measurement. Symbols, notes, surface-finish marks and material details can all affect how a part is manufactured and checked.",
      "Measurement tools must be selected for the feature and tolerance. A steel rule is suitable for rough checks; vernier or digital calipers measure external, internal and depth features within their capability; micrometers provide more controlled measurement of suitable dimensions; dial indicators help compare alignment or variation. Instrument resolution does not automatically guarantee accuracy. Clean contact surfaces, zero checks, suitable measuring force and calibration status matter."
    ],
    [
      { title: "Read the title block", detail: "Confirm drawing number, revision, units, scale, material and general tolerance notes before reading individual dimensions." },
      { title: "Interpret the views", detail: "Compare front, top and side views. Use section or detail views when provided and identify hidden or reference features." },
      { title: "Understand tolerances", detail: "Read the nominal size and permitted variation. Identify datum references and geometric controls where shown." },
      { title: "Choose the instrument", detail: "Select an instrument capable of measuring the feature and tolerance. Check its condition, zero and calibration status." },
      { title: "Measure and record", detail: "Clean the part and instrument, use suitable measuring force, repeat as required and record the result with units." }
    ],
    [
      "A shaft drawing gives a diameter with a tolerance. The learner checks the drawing units and tolerance first, selects a suitable micrometer, confirms the instrument's zero, and measures at the locations required by the inspection plan. The result is recorded with the correct unit and instrument identification.",
      "If a caliper reading appears inconsistent, the learner checks for burrs, dirt, tilted jaws, incorrect contact and zero error before deciding that the part is out of tolerance."
    ],
    [
      "Do not measure from a drawing scale when a numerical dimension is provided.",
      "Do not ignore units, drawing revision, tolerance signs or datum references.",
      "Do not force an instrument onto a part; excessive measuring force can distort readings.",
      "Do not round a result in a way that hides a tolerance failure. Record the required precision."
    ]
  ),
  "cnc-lathe": buildLessonSections(
    [
      "A CNC lathe usually rotates the workpiece while a cutting tool moves along controlled axes. Facing produces a flat end; turning reduces the outside diameter; boring enlarges or finishes an internal feature; grooving creates a narrow recess; and threading forms a helical profile using a programmed relationship between spindle rotation and tool movement. The exact operations available depend on the machine and tooling.",
      "Workholding is critical because the component rotates. The chuck, collet, centres or other fixture must suit the stock and operation. The tool must be compatible with the material and set correctly using the setup documentation. Speeds, feeds, depth of cut and tool geometry are process-specific values and must come from the approved process plan, tooling data and instructor."
    ],
    [
      { title: "Study the part drawing", detail: "Identify finished diameters, lengths, shoulders, grooves, bores, threads and required tolerances." },
      { title: "Select workholding", detail: "Choose the approved chuck, collet or support arrangement and confirm that stock projection and clamping are suitable." },
      { title: "Prepare tools and offsets", detail: "Match tool stations and inserts to the setup sheet, inspect edges and verify offsets using the documented procedure." },
      { title: "Prove the sequence", detail: "Verify facing, turning and other operations in the correct order. Use the machine's approved proving method before cutting." },
      { title: "Inspect the first-off part", detail: "Measure critical diameters and lengths, check burrs and surface condition, and obtain approval before continuing production." }
    ],
    [
      "For a stepped shaft, the process plan may begin with facing and then create the required outside diameters and shoulders. Each operation is checked against the drawing. The learner does not rely only on the machine display; the finished part is measured with the correct instrument.",
      "If vibration, abnormal noise or a loose workpiece is suspected, stop the machine using the normal safe stop procedure and inform the supervisor. Never reach into a rotating chuck to investigate."
    ],
    [
      "Never operate a lathe with the door open or reach near a rotating chuck or workpiece.",
      "Do not guess cutting data or substitute an insert without checking the process plan.",
      "Check stock projection, chuck engagement and tool clearance before cycle start.",
      "Remove chips only with the approved tool after the spindle has stopped; never use bare hands."
    ]
  ),
  "cnc-milling": buildLessonSections(
    [
      "In milling, a rotating cutter removes material from a workpiece held in a vice, fixture or other approved workholding device. Common operations include face milling, slotting, profiling, pocketing and drilling. The tool path, cutter geometry, material and fixture all influence the result. Axis movement and work coordinate references determine where the cutter travels relative to the part.",
      "A reliable milling setup requires secure clamping and sufficient clearance for the cutter, holder and spindle. Cutter selection depends on material, feature, reach, rigidity and finish requirement. Conventional and climb milling describe the relationship between cutter rotation and feed direction; which method is suitable depends on machine rigidity, backlash control, cutter and procedure. Verify cutting data through approved sources rather than using generic values."
    ],
    [
      { title: "Review geometry and operations", detail: "Break the drawing into faces, slots, holes, profiles and pockets. Identify which operations and tools are required." },
      { title: "Clamp and locate the work", detail: "Clean the vice or fixture, position the stock against suitable references and confirm that clamping is secure." },
      { title: "Install and measure tools", detail: "Fit the specified cutter and holder, inspect the cutting edges and enter or verify tool data using the setup sheet." },
      { title: "Set the work reference", detail: "Establish the work origin and check tool clearance and the planned path using the approved proving method." },
      { title: "Machine and inspect", detail: "Run the verified sequence with guarding in place, then inspect dimensions, surface finish and burrs as required." }
    ],
    [
      "A slot is to be milled in a rectangular block. The learner checks the drawing depth and position, confirms that the block is seated against the fixture references and verifies the cutter path before the first cut. The slot is measured after machining and the result is compared with the tolerance.",
      "A loose clamp, an unverified offset or an unexpected sound is a reason to stop and investigate. The operator must not open the enclosure or adjust the work while the spindle is moving."
    ],
    [
      "Do not use a cutter with visible damage or an unsuitable reach for the operation.",
      "Do not leave chips on locating surfaces; they can tilt the workpiece and affect dimensions.",
      "Keep guards closed and wait for the spindle to stop before measurement or chip removal.",
      "Verify cutter clearance and workholding before the program is run."
    ]
  ),
  "g-code": buildLessonSections(
    [
      "CNC programs describe machine movements and auxiliary actions in structured blocks. G-codes commonly select motion or coordinate-related modes; M-codes commonly control auxiliary functions such as spindle, coolant or program flow. Address letters identify data such as axes, feed, speed, tool and offsets. The exact meaning and availability of a code can vary by controller, so the machine's programming manual is the authoritative reference.",
      "Some commands are modal: once selected, they remain active until another command changes the mode. A program therefore needs a safe and deliberate sequence. The programmer must understand the active plane, units, work coordinate, tool offsets, feed mode and spindle state. A syntactically valid program can still be unsafe if it contains an incorrect coordinate, offset or tool call."
    ],
    [
      { title: "Read the program header", detail: "Identify the program number, revision, units, coordinate system and any comments describing the operation." },
      { title: "Check each block", detail: "Read the tool call, work offset, spindle command, coolant command and movement commands in their actual sequence." },
      { title: "Track modal states", detail: "Confirm which units, plane, absolute or incremental mode, feed mode and compensation states are active." },
      { title: "Review tool and coordinate data", detail: "Compare every tool number and offset with the setup sheet and verify that coordinates match the drawing." },
      { title: "Simulate and prove safely", detail: "Use the correct controller simulator and the approved machine proving routine. Never treat an example program as ready for production." }
    ],
    [
      "A training block containing a rapid move is reviewed by checking the current work origin, tool length offset and clearance. The learner traces the position before and after the move rather than assuming that the displayed coordinate is safe.",
      "A program copied from another controller is checked line by line because the same code or format may behave differently across machines."
    ],
    [
      "Do not run copied or edited code without controller-specific verification and approval.",
      "Do not overlook modal commands; an earlier mode may still affect a later block.",
      "Do not assume G-code and M-code meanings are identical across every controller.",
      "Use simulation, dry-run and single-block procedures as required by the machine and workshop."
    ]
  ),
  "tooling-quality": buildLessonSections(
    [
      "Cutting tools are selected according to the operation, workpiece material, machine rigidity, tool reach and required finish. Tool geometry affects chip formation and cutting forces; insert grade and coating affect wear resistance and suitability for a material range. Tool life is influenced by cutting conditions, setup rigidity, coolant strategy and interrupted cutting. The correct choice must come from approved tooling data and the process plan.",
      "Quality control links the drawing to actual measurement. The first-off part is checked before production proceeds, and critical dimensions are monitored at the frequency in the inspection plan. Wear can appear as edge rounding, chipping, built-up material or surface-finish change. If a result is outside tolerance, the part is identified and contained; an operator must not alter recorded readings or hide a nonconformance."
    ],
    [
      { title: "Read the quality requirements", detail: "Identify critical dimensions, tolerances, surface-finish requirements, datums and inspection frequency from the drawing and control plan." },
      { title: "Choose tooling from approved data", detail: "Match insert, cutter, holder and tool geometry to the material and operation using manufacturer and process documentation." },
      { title: "Inspect the tool", detail: "Check cutting edges, seating, clamping and runout as required. Replace or report damaged tooling before use." },
      { title: "Inspect the first-off part", detail: "Use suitable calibrated instruments, record actual readings and obtain the required approval before a production run." },
      { title: "Monitor and record", detail: "Watch for wear indicators, measure at the defined intervals and document tool changes and nonconformances." }
    ],
    [
      "A turned part begins to show a deteriorating surface finish. The operator checks the tool edge, workholding and process conditions, then compares the findings with the approved troubleshooting guide. Any tool change or offset adjustment is recorded and the next part is inspected.",
      "If a critical dimension is outside tolerance, production is paused according to the control plan and affected parts are identified. The operator does not simply alter the inspection value or continue making parts."
    ],
    [
      "Do not select an insert solely because it fits the holder; material and operation suitability matter.",
      "Do not use uncalibrated or damaged measuring instruments for acceptance decisions.",
      "Do not continue production after a suspected quality issue without containment and approval.",
      "Keep tool-change, offset and inspection records traceable to the part and machine."
    ]
  ),

  "skin-anatomy": buildLessonSections(
    [
      "The skin forms a protective barrier and helps regulate temperature and sensation. It is commonly described in three broad layers: the epidermis, dermis and subcutaneous tissue. The epidermis is the outer protective layer; the dermis contains structural tissue, blood vessels, nerves and skin appendages; the subcutaneous layer contains connective and fatty tissue beneath the dermis. Skin-care services work mainly at the surface and must remain within the practitioner’s training and service protocol.",
      "Skin type is often described in terms such as normal, dry, oily or combination, while skin conditions such as dehydration, sensitivity, redness or blemishes can change over time. A type is not a diagnosis. A client may have more than one visible concern. Product selection should be conservative and based on consultation, the product label and service suitability. Persistent, painful, changing or unusual skin concerns should be referred to an appropriate healthcare professional."
    ],
    [
      { title: "Explain the service and obtain consent", detail: "Describe what a basic skin observation involves, ask permission and confirm the client's comfort and preferences." },
      { title: "Observe without diagnosing", detail: "Note visible oiliness, dryness, texture, sensitivity or areas that should be avoided. Do not label a medical condition." },
      { title: "Consider the skin barrier", detail: "Choose gentle products and avoid unnecessary friction or aggressive treatment, especially when the skin appears sensitive." },
      { title: "Select suitable care", detail: "Use products intended for the service and client profile, following directions and any required patch-test procedure." },
      { title: "Explain after-care", detail: "Give simple care guidance and identify when the client should seek professional medical advice." }
    ],
    [
      "A client describes tightness after cleansing and has visible dry areas. The practitioner records the observation, asks about the client's routine and selects a gentle service option within the salon protocol. The practitioner does not diagnose a skin disease or recommend medication.",
      "If the client has a new, painful or visibly inflamed area, the service is adjusted or paused and the referral policy is followed rather than covering the area with a cosmetic treatment."
    ],
    [
      "Do not confuse a cosmetic skin type with a medical diagnosis.",
      "Avoid aggressive exfoliation or friction when the skin appears compromised or sensitive.",
      "Check product directions and client suitability before applying a new product.",
      "Refer persistent, painful, changing or unexplained skin concerns outside the practitioner's scope."
    ]
  ),
  "skin-analysis": buildLessonSections(
    [
      "Skin analysis is a consultation-led observation used to select a suitable cosmetic service. It combines what the client reports with what the practitioner can safely observe. Useful topics include the client's goal, current routine, sensitivities, products in use, recent treatments and comfort preferences. The aim is to understand suitability, not to diagnose a medical condition or promise that a cosmetic service will resolve a health problem.",
      "A good record is factual and relevant. Describe visible observations neutrally, note areas to avoid, record product sensitivities reported by the client and document consent. If information suggests that the service may be unsuitable, pause and follow the salon's referral or supervisor procedure. A client should be able to understand the planned steps and decline any part of the service."
    ],
    [
      { title: "Prepare a private consultation", detail: "Welcome the client, explain the purpose of the questions and protect their privacy." },
      { title: "Ask relevant questions", detail: "Discuss goals, current routine, product use, sensitivities, recent treatments and any contraindications listed in the service protocol." },
      { title: "Observe with consent", detail: "Use suitable lighting and observe the skin without unnecessary pressure or invasive methods. Keep notes descriptive." },
      { title: "Decide on suitability", detail: "Compare the information with the service protocol. Modify, postpone or refer when a concern is outside the service scope." },
      { title: "Agree and document", detail: "Explain the selected service and after-care, obtain informed consent and keep an accurate record." }
    ],
    [
      "A client requests exfoliation but reports a recent strong skin treatment and ongoing sensitivity. The practitioner checks the service protocol and does not proceed automatically. The client is offered a safer alternative or advised to obtain appropriate professional guidance before rescheduling.",
      "If the client does not wish to answer a question, explain why it is relevant and respect their choice. If the information is essential to safe service delivery, the practitioner may need to postpone the treatment."
    ],
    [
      "Do not use a checklist as a substitute for listening to the client.",
      "Do not diagnose acne, infection, allergy or another medical condition from appearance.",
      "Do not continue when suitability information is missing or a protocol contraindication is present.",
      "Keep records factual, confidential and limited to what is needed for the service."
    ]
  ),
  "facial-treatments": buildLessonSections(
    [
      "A basic facial is a planned cosmetic service that may include consultation, cleansing, skin observation, appropriate exfoliation, a mask and moisturising or protective finish. The exact sequence depends on the service design, products and client's suitability. Each step has a purpose: cleansing removes surface residue, exfoliation helps remove selected surface build-up when suitable, a mask supports the chosen service goal, and moisturising helps maintain comfort.",
      "The practitioner must follow product directions and avoid treating areas that are unsuitable. Stronger is not automatically better: excessive pressure, repeated exfoliation or combining products without approval can irritate the skin. Temperature, fragrance, contact time and removal method should follow the product instructions. Client comfort should be checked at every stage."
    ],
    [
      { title: "Consult and prepare", detail: "Confirm goals, sensitivities, recent treatments and service suitability. Prepare clean linens, tools and products." },
      { title: "Cleanse gently", detail: "Use the approved cleanser and removal method. Avoid rubbing or pulling and keep product away from areas the protocol excludes." },
      { title: "Exfoliate only when suitable", detail: "Select the method allowed by the service plan and follow its exact directions. Skip or modify this step when the protocol requires it." },
      { title: "Apply the selected mask", detail: "Use a clean applicator, avoid prohibited areas and observe the stated contact time and removal process." },
      { title: "Finish and advise", detail: "Apply appropriate finishing products, check comfort and explain simple after-care and sun-protection guidance where relevant." }
    ],
    [
      "A client with sensitive-feeling skin books a facial. After consultation, the practitioner selects a gentle service and omits any step that the protocol says is unsuitable. The client is told what each product is for and is asked to report discomfort immediately.",
      "If stinging, swelling or unexpected irritation occurs, stop the step and follow the product and salon response procedure. Do not add another product in an attempt to cover the reaction."
    ],
    [
      "Do not assume every facial must include exfoliation; suitability comes first.",
      "Do not exceed the product's contact time or combine products outside the directions.",
      "Use clean applicators and avoid reintroducing used product into a shared container.",
      "Maintain draping, comfort checks and a clear after-care explanation."
    ]
  ),
  "hair-removal": buildLessonSections(
    [
      "Hair-removal methods include shaving, threading, waxing and other techniques available within the practitioner's training. Methods differ in how they interact with the hair and skin, the equipment required and the after-care expected. Suitability depends on the treatment area, skin condition, client preference, recent treatments and the method's contraindications. The service protocol and product instructions define when a method must not be used.",
      "Preparation and hygiene are essential. The treatment area should be observed with consent, cleaned using the approved method and protected from cross-contamination. Wax temperature and product use must follow the manufacturer's guidance and equipment instructions. Single-use applicators must not be dipped back into shared product after touching the client. After-care should explain how to reduce friction and irritation and when to seek professional advice."
    ],
    [
      { title: "Consult and screen", detail: "Ask about sensitivities, relevant medication or recent skin procedures using the service's approved questions. Check the treatment area's suitability." },
      { title: "Prepare the area", detail: "Explain the procedure, obtain consent, clean the area and prepare fresh linens and single-use or disinfected tools as required." },
      { title: "Check product and equipment", detail: "Use the correct product for the method and verify equipment condition and temperature using the manufacturer's instructions." },
      { title: "Perform within training", detail: "Use the taught technique, protect the surrounding skin and stop if the client reports unusual pain or an unexpected reaction." },
      { title: "Finish and advise", detail: "Remove residue using the approved method, inspect the area and provide clear after-care guidance." }
    ],
    [
      "Before waxing, a client reports recent use of a product that may increase skin sensitivity. The practitioner checks the service's contraindication guidance and postpones or changes the service if required. The practitioner does not rely on guesswork.",
      "During a supervised demonstration, the learner uses a fresh applicator for each application and keeps used materials separate from clean products and tools."
    ],
    [
      "Never double-dip a single-use applicator into a shared wax or product container.",
      "Do not apply a product when its temperature, condition or suitability is uncertain.",
      "Do not treat broken, irritated or otherwise unsuitable skin contrary to the service protocol.",
      "Explain after-care and refer unusual pain, blistering or persistent reaction through the appropriate route."
    ]
  ),
  "makeup-fundamentals": buildLessonSections(
    [
      "Professional makeup is planned around the client's preferences, skin preparation, occasion, lighting and the desired finish. A natural daytime finish may use lighter coverage and soft definition, while event makeup may need a different level of coverage and setting. Product selection should consider shade, texture, finish and compatibility with the client's skin. Foundation matching should be checked in appropriate lighting and blended so there is no obvious difference at the jawline.",
      "Hygiene must be maintained while products are applied. Wash hands, use clean brushes, use disposable applicators where required and avoid direct contamination of shared creams or liquids. Makeup is built in controlled layers: preparation, complexion, feature definition and finishing. Removing makeup gently and cleaning tools after the service are part of the professional service, not optional extras."
    ],
    [
      { title: "Consult about the look", detail: "Ask about the occasion, preferred coverage, colours, finish, sensitivities and how the client normally wears makeup." },
      { title: "Prepare skin and tools", detail: "Clean hands, prepare the skin with suitable products and arrange sanitised brushes and disposable applicators." },
      { title: "Match the complexion", detail: "Test suitable shades in appropriate lighting and check the face-to-neck transition before applying the full layer." },
      { title: "Build the look", detail: "Apply products in controlled layers, blend edges and check balance from normal viewing distance and lighting." },
      { title: "Finish and clean", detail: "Set the look as appropriate, confirm client comfort, remove makeup gently when requested and clean tools and work surfaces." }
    ],
    [
      "A client needs makeup for an outdoor daytime event. The artist asks about preferred coverage and photographs, checks shade in natural-looking light and selects a finish suited to the event rather than applying a heavy studio look automatically.",
      "If irritation begins after a product is applied, stop using it and follow the salon's response procedure. Do not continue layering products over the affected area."
    ],
    [
      "Do not test foundation only on the back of the hand; check the face and jawline in suitable lighting.",
      "Do not share mascara, lip or cream products using an applicator that has touched the client.",
      "Avoid excessive product layers that change the finish or feel uncomfortable.",
      "Clean brushes and tools after use and store products according to their label."
    ]
  ),
  "esthetics-hygiene": buildLessonSections(
    [
      "Sanitation is the set of routines used to keep the treatment environment clean and reduce avoidable contamination. Cleaning removes soil and product residue; disinfection uses an approved product on suitable surfaces or equipment; sterilisation is a separate validated process used for items that require it under applicable rules. These terms should not be used interchangeably. The appropriate method depends on the item, its material, the service and local regulations.",
      "Client care also has a safety and dignity component. Practitioners explain the service, obtain informed consent, provide suitable draping, protect privacy and check comfort. Hand hygiene, fresh linens, clean storage, waste segregation and incident reporting should be routine. If a spill, exposure, injury or unexpected reaction occurs, stop the service and follow the salon's documented procedure."
    ],
    [
      { title: "Prepare the treatment room", detail: "Clean and disinfect surfaces using compatible products and the label's contact time. Arrange clean linens and covered clean supplies." },
      { title: "Perform hand hygiene", detail: "Clean hands at the required moments before and after client contact and after handling used equipment or waste." },
      { title: "Protect client dignity", detail: "Explain each step, obtain consent, use appropriate draping and expose only the area required for the service." },
      { title: "Manage tools and waste", detail: "Separate clean and used items, process reusable equipment correctly and dispose of single-use items and waste under local rules." },
      { title: "Close and document", detail: "Clean the room, replenish supplies, record incidents and secure client records according to policy." }
    ],
    [
      "Between two facial appointments, the practitioner removes used linen, cleans visible product residue, disinfects the treatment surface for the required contact time and prepares fresh supplies. The clean tray is kept away from the used-tool container.",
      "If a client becomes unwell or an unexpected reaction occurs, the practitioner stops, protects the client, obtains assistance according to training and records the event through the approved process."
    ],
    [
      "Do not describe a surface as disinfected if the required contact time was not completed.",
      "Do not store clean towels with used linen or place clean tools on a contaminated surface.",
      "Do not skip consent or draping because a service is familiar or routine.",
      "Follow local requirements for sharps, waste, reusable instruments and incident reporting."
    ]
  ),

  "pos-fundamentals": buildLessonSections(
    [
      "A point-of-sale system connects checkout activity with records that may include products, stock, discounts, taxes, customers, payments and reports. Hardware can include a terminal, barcode scanner, receipt printer, cash drawer and payment device. Software controls the transaction flow and stores the records. The exact capabilities depend on the retailer's system and configuration.",
      "Users should sign in with an individual authorised account so that actions are traceable. Role permissions determine which functions a cashier, supervisor or administrator can use. A normal sale moves from item entry to cart review, total confirmation, payment, receipt and stock update. Void, refund, discount and override functions may require additional permissions and must follow store policy."
    ],
    [
      { title: "Sign in securely", detail: "Use your own authorised account, confirm the correct store or register and never share credentials." },
      { title: "Complete opening checks", detail: "Check power, network, scanner, receipt paper, cash drawer and payment terminal using the store checklist." },
      { title: "Understand the sale flow", detail: "Enter products, verify the cart, confirm totals, collect the approved payment and wait for a completed status." },
      { title: "Use exceptions correctly", detail: "Follow permissions and approval steps for voids, refunds, discounts and manual price changes." },
      { title: "Close the shift", detail: "Sign out or hand over the register as instructed and complete required cash and transaction checks." }
    ],
    [
      "A cashier starts a shift and notices the receipt printer is not connected. The cashier follows the opening procedure and reports the fault before serving customers, rather than assuming a sale can be completed without a receipt or record.",
      "A supervisor requests a price override. The cashier checks that the account has the required permission and records the approved reason according to store policy."
    ],
    [
      "Do not share user accounts or leave a register signed in when unattended.",
      "Do not mark a transaction complete until the POS confirms the required payment status.",
      "Do not bypass manager approval for restricted functions.",
      "Follow the store's outage and fallback process instead of inventing a manual workaround."
    ]
  ),
  "product-inventory": buildLessonSections(
    [
      "A product master record is the reference used by checkout and inventory. It may include product name, SKU, barcode, category, unit, selling price, tax configuration and other attributes. A SKU is an internal stock identifier; a barcode is a scannable code that the system maps to a product record. The two are related but are not automatically the same value.",
      "Receiving stock updates the system from a delivery event. Quantities must be checked against the purchase order or delivery note, and damaged, missing or substituted items must be recorded before stock is accepted. Stock adjustments need an authorised user and a reason so the audit history remains meaningful. Accurate item records help prevent wrong scans, incorrect prices and misleading stock reports."
    ],
    [
      { title: "Check the source document", detail: "Open the purchase order or delivery note and confirm supplier, date, product identifiers and expected quantities." },
      { title: "Inspect the delivery", detail: "Check item description, unit, pack size, condition and actual quantity. Separate damaged or unexpected stock." },
      { title: "Match product records", detail: "Confirm the SKU, barcode, product name, category and price against the approved master data." },
      { title: "Record receipt or discrepancy", detail: "Enter the accepted quantity and document shortages, overages or damage using the approved receiving workflow." },
      { title: "Verify stock result", detail: "Check the updated on-hand quantity and retain the receiving record for traceability." }
    ],
    [
      "A delivery contains ten units on the document but only nine are physically present. The receiver records the actual count and follows the discrepancy procedure; they do not enter ten simply to match the purchase order.",
      "When a new barcode is added, it is tested against the correct product record before the item is placed for sale. Duplicate barcodes or incorrect pack sizes are escalated rather than silently overwritten."
    ],
    [
      "Do not confuse SKU, barcode and product description; verify their mapping.",
      "Do not accept damaged or missing items without recording the discrepancy.",
      "Do not change a price, tax category or stock quantity without the required authority.",
      "Keep stock adjustments traceable to a reason, date and authorised user."
    ]
  ),
  "billing-checkout": buildLessonSections(
    [
      "Checkout is a sequence of verification steps. Each scanned or searched item must match the product the customer is buying. Quantity, unit and any configured discount or promotion must be reviewed before payment. The POS calculates totals using the store's configured tax and pricing rules. Cashiers should not manually change values to make a total look correct.",
      "Payment completion is a separate step from entering a payment method. The terminal or provider must return the status required by the POS. A pending or declined payment is not a completed sale. Once the payment is confirmed, the system records the transaction and issues the receipt. If the scanner, network or terminal fails, use only the store's approved fallback process."
    ],
    [
      { title: "Identify each item", detail: "Scan the barcode or search the approved catalogue, then check the displayed description and unit." },
      { title: "Verify quantity and cart", detail: "Confirm quantities, remove accidental duplicates and review the full basket with the customer." },
      { title: "Review pricing", detail: "Check configured discounts, promotions, tax and the final amount. Request approval for any exception." },
      { title: "Collect payment", detail: "Select the actual payment type, follow the terminal prompts and wait for a confirmed status." },
      { title: "Issue and verify receipt", detail: "Confirm the sale is complete, provide the receipt and check that the POS recorded the transaction." }
    ],
    [
      "A customer buys two units of one product and one unit of another. The cashier checks each description and quantity, reviews the basket and confirms the total before taking payment. The receipt is checked against the items sold.",
      "If the payment terminal shows pending, the cashier does not retry repeatedly or tell the customer that payment succeeded. The approved status-check procedure is followed to avoid duplicate charges."
    ],
    [
      "Do not finalise a cart before checking item descriptions and quantities.",
      "Do not create an unauthorised discount or alter tax configuration at checkout.",
      "Do not treat a pending or declined payment as successful.",
      "Use the approved fallback process for network or hardware failures."
    ]
  ),
  "payments-taxes": buildLessonSections(
    [
      "A POS may accept cash, card, contactless, wallet or other configured payment methods. The payment method selected in the register must match the tender actually received. Payment statuses may include pending, approved, declined, reversed or refunded; the exact labels differ by provider. The cashier must understand the status shown by the terminal and follow the store's procedure before completing or retrying a transaction.",
      "A split payment combines more than one tender type to pay one total. Each part must be entered accurately and the combined amount must reconcile to the amount due. Discounts and taxes are controlled by the retailer's configuration and applicable rules. The cashier should not calculate a new tax rate or invent a discount. Uncertain, duplicate or reversed transactions must be escalated using the payment provider and store process."
    ],
    [
      { title: "Confirm the amount due", detail: "Review the final cart total and explain any configured discount or tax line if the customer asks." },
      { title: "Select the actual tender", detail: "Choose the payment type the customer is using and follow the terminal or cash-handling procedure." },
      { title: "Handle split payments", detail: "Enter each tender amount carefully and verify that the remaining balance updates correctly." },
      { title: "Wait for final status", detail: "Do not close the sale while the transaction is pending. Follow the provider procedure for declined or uncertain statuses." },
      { title: "Verify the record", detail: "Check the receipt and payment record, then escalate duplicate, reversed or mismatched transactions." }
    ],
    [
      "A customer pays part in cash and the remainder by card. The cashier enters the cash amount, confirms the remaining balance and processes the card payment. The sale is completed only after the required confirmation is received.",
      "If the terminal shows an uncertain result, the cashier checks the transaction status through the approved process before attempting another charge. This reduces the risk of duplicate payments."
    ],
    [
      "Do not select a payment method that differs from the tender actually received.",
      "Do not mark a payment successful based only on a customer notification or verbal statement.",
      "Do not change configured tax rules or apply an unauthorised discount.",
      "Keep payment receipts and transaction references available for authorised reconciliation."
    ]
  ),
  "returns-refunds": buildLessonSections(
    [
      "A return is a request to send a purchased item back; an exchange replaces it with another item; a refund returns money according to the store's policy. Eligibility may depend on proof of purchase, date, item condition, product category and legal or store restrictions. The POS action must match the actual outcome. A returned item may be restocked, quarantined, written off or sent for inspection depending on its condition and the store's rules.",
      "A refund also changes financial records and may need a payment reversal or separate refund transaction. The cashier should check the original transaction and use the method required by policy. Exceptions require approval. Accurate reason codes, returned quantities and stock disposition protect the customer and maintain reliable inventory and sales reports."
    ],
    [
      { title: "Locate the original sale", detail: "Use the receipt, transaction reference or approved lookup to find the original purchase." },
      { title: "Check eligibility", detail: "Compare purchase date, proof, item condition and category with the current return policy." },
      { title: "Confirm the requested outcome", detail: "Establish whether the customer is requesting a return, exchange, repair or refund and explain the applicable process." },
      { title: "Obtain approval and process", detail: "Use the correct POS action and refund method. Obtain supervisor approval for exceptions or restricted cases." },
      { title: "Record and communicate", detail: "Enter the reason and quantity, set the correct stock disposition and provide the customer with confirmation." }
    ],
    [
      "A customer presents a receipt for an item that appears damaged. The cashier checks the original transaction and return policy, then follows the approved process for inspection and refund or replacement. The item is not returned to sellable stock unless it passes the required checks.",
      "If the receipt cannot be found, the cashier follows the store's alternate proof-of-purchase process rather than promising a refund outside policy."
    ],
    [
      "Do not process a refund without confirming the original transaction and eligibility.",
      "Do not return damaged or opened stock to sellable inventory without the required inspection.",
      "Do not refund to an unauthorised method or bypass exception approval.",
      "Record the reason and quantity accurately so reports and stock remain consistent."
    ]
  ),
  "pos-reports": buildLessonSections(
    [
      "POS reports summarise activity for a selected period and register. Depending on the system, they may show sales, discounts, taxes, returns, payment types, transaction counts and cashier activity. Report labels and calculation rules vary, so the store's reporting guide should define what each total includes. A cashier or supervisor should compare like-for-like periods and avoid mixing gross, net, tax and tender values.",
      "Cash reconciliation compares the expected cash position with the physical drawer count. The expected amount is based on the opening float and recorded cash movements such as cash sales, cash refunds, paid-outs or cash drops, according to the store's method. The count should follow any dual-control rule. Differences must be investigated and documented, not hidden by changing the POS figures."
    ],
    [
      { title: "Select the correct report period", detail: "Confirm the business date, register, shift and report type before interpreting totals." },
      { title: "Review transaction summaries", detail: "Check sales, discounts, returns, taxes and payment-type totals using the system's definitions." },
      { title: "Calculate expected cash", detail: "Use the store's reconciliation method and include the opening float and every recorded cash movement." },
      { title: "Count and compare", detail: "Count physical cash using the required verification process and compare it with the expected drawer amount." },
      { title: "Record and close", detail: "Document any difference, investigate using transaction records, complete terminal settlement and submit reports securely." }
    ],
    [
      "At shift end, a supervisor prints the register summary, confirms the date and register, counts the drawer using the store's procedure and compares it with expected cash. A difference is recorded and investigated through transaction records rather than adjusting sales totals.",
      "If card settlement and POS card totals do not match, the supervisor checks batch status and transaction references using the payment provider's approved process before closing the reconciliation."
    ],
    [
      "Do not compare reports from different dates, registers or shift scopes as though they were equivalent.",
      "Do not change the opening float or sales record to force a cash match.",
      "Do not ignore refunds, paid-outs, cash drops or pending terminal batches when the procedure includes them.",
      "Keep reports and discrepancy records secure and share them only with authorised staff."
    ]
  ),
};

const makeModule = (id, title, description, overview, learningPoints) => ({
  id,
  title,
  description,
  overview,
  learningPoints,
  lessonSections: vocationalLessonDetails[id] || [],
  guidedPractice: moduleEnrichment[id]?.guidedPractice || "Review the lesson overview, apply the learning points in a supervised training scenario and explain the decisions you made.",
  professionalChecklist: moduleEnrichment[id]?.professionalChecklist || [],
});

export const courseCategories = [
  {
    id: "hairstyling",
    name: "Hairstyling",
    category: "Beauty & Personal Care",
    description: "Build professional foundations in hair care, cutting, styling, colouring and client service.",
    level: "Beginner to Advanced",
    accent: "gold",
    type: "vocational",
    duration: "6 learning modules",
    outcomes: [
      "Identify hair and scalp characteristics before selecting a service.",
      "Prepare tools, products and workstations using salon hygiene practices.",
      "Apply foundational cutting, styling and colouring techniques safely.",
      "Consult with clients and explain suitable after-care routines.",
    ],
    modules: [
      makeModule("hair-scalp-fundamentals", "Hair & Scalp Fundamentals", "Understand hair structure, growth, scalp conditions and basic care selection.", "Hair services begin with understanding the hair and scalp. Hair is formed from a visible shaft and a follicle beneath the skin. Its texture, density, porosity and elasticity influence how it responds to washing, heat, styling and chemical services. A careful consultation helps a stylist choose a suitable service rather than relying on appearance alone.\n\nThe scalp should be observed for visible irritation, sensitivity or unusual conditions. When a concern appears outside a stylist's role, pause the service and recommend that the client seek advice from an appropriate healthcare professional.", ["The hair shaft has three main layers: cuticle, cortex and medulla; not every hair type has a prominent medulla.", "Hair texture describes strand thickness, while density describes how many strands grow in an area.", "Porosity affects how quickly hair absorbs and loses moisture or chemical products.", "Elasticity is the hair's ability to stretch and return; poor elasticity can indicate weakness.", "A scalp check and client consultation should happen before selecting a treatment or chemical service."]),
      makeModule("tools-hygiene", "Tools, Products & Hygiene", "Recognise salon tools, product purpose, cleaning routines and workstation preparation.", "A professional workstation is organised before the client is seated. Combs, brushes, scissors, clips, dryers and styling tools each have a defined purpose. Products should be selected according to the client's hair type, service goal and manufacturer directions. Never mix products or improvise chemical processes.\n\nClean tools between clients, disinfect reusable implements according to product instructions, and discard single-use items after use. Keep electrical equipment dry, inspect cords and store hot tools safely after switching them off.", ["Clean tools first to remove visible debris before applying the correct disinfecting process.", "Use clean towels, capes and single-use items for each client.", "Read product labels, directions, warnings and patch-test guidance before use.", "Keep electrical tools away from water and inspect plugs and cords before use.", "Store sharp and heated tools safely, and keep the workstation uncluttered."]),
      makeModule("basic-haircutting", "Basic Haircutting", "Learn consultation, sectioning, elevation, cutting lines and foundational haircut control.", "A haircut is planned before the first cut. Confirm the requested length, shape, maintenance preference and any limitations with the client. Drape the client correctly, detangle the hair and create clean sections so that the work remains controlled.\n\nBasic cutting depends on body position, finger angle, tension, elevation and a consistent guide. Work methodically, check balance from more than one angle and remove small amounts when refining the shape. Scissors and razors must be handled safely and used only with appropriate training.", ["Confirm the desired result and agree on the amount of length to remove before cutting.", "Use clean sections and clips to keep working hair separate from unworked hair.", "A guide section helps maintain consistent length and shape through the haircut.", "Elevation and cutting angle change weight distribution and the final silhouette.", "Cross-check both sides and the outline before finishing the haircut."]),
      makeModule("styling-techniques", "Hair Styling Techniques", "Explore blow-drying, setting, braiding, finishing and heat-protection principles.", "Styling combines preparation, sectioning, tool control and finishing. Start with clean, appropriately conditioned hair and apply products sparingly according to the intended result. Divide the hair into manageable sections and direct airflow from roots toward the ends when smoothing the cuticle.\n\nHeat tools can damage hair when the temperature, contact time or technique is unsuitable. Use a heat protectant when recommended, select a controlled temperature and keep hot tools moving. Allow curls or sets to cool before brushing or loosening them so the style can hold its shape.", ["Choose styling products according to the finish required, such as hold, volume, smoothness or texture.", "Sectioning improves control and helps produce an even finish.", "Directing dryer airflow from roots to ends can help smooth the hair surface.", "Use heat protection and a suitable temperature to reduce avoidable heat damage.", "Let a curl or set cool before loosening it to help the shape last longer."]),
      makeModule("colouring-treatments", "Hair Colouring & Treatments", "Understand colour consultation, strand and patch testing, application planning and after-care.", "Colour services require a clear consultation and careful attention to manufacturer instructions. Discuss the client's colour history, desired result, maintenance expectations and possible limitations. Check product compatibility and carry out the tests required by the product manufacturer and local salon policy before proceeding.\n\nUse the correct developer, mixing ratio, timing and application method specified for the product. Protect the client's skin and clothing, monitor the process and rinse thoroughly as directed. Recommend suitable after-care and explain that results can vary with hair condition and previous chemical services.", ["A colour consultation should record previous colour and chemical-service history.", "Follow the manufacturer's mixing ratio, processing time and safety directions exactly.", "Complete required patch and strand tests within the specified time before the service.", "Do not apply colour to irritated or broken skin; follow the product's safety guidance.", "Explain maintenance, colour-safe care and realistic results before the client leaves."]),
      makeModule("client-consultation", "Client Consultation & Salon Service", "Practise listening, service planning, client records, communication and after-care advice.", "Consultation connects the client's expectations with a safe and achievable service. Ask open questions, listen carefully and confirm the result in clear language. Discuss time, maintenance, price and any relevant service limitations before beginning. Record the plan according to salon procedures and protect client information.\n\nDuring the service, explain what is happening, check comfort and respond professionally to feedback. At the end, show the result, provide practical after-care instructions and invite the client to ask questions.", ["Use open questions to understand the client's goals and everyday styling routine.", "Agree on the service plan, maintenance needs, timing and cost before starting.", "Keep client records accurate, relevant and confidential.", "Check comfort and communicate clearly throughout the service.", "Give realistic after-care advice and explain when the client should return for maintenance."]),
    ],
  },
  {
    id: "welding",
    name: "Welding",
    category: "Industrial & Technical Skills",
    description: "Develop workshop knowledge in welding safety, equipment, processes, joints and inspection.",
    level: "Beginner to Advanced",
    accent: "teal",
    type: "vocational",
    duration: "6 learning modules",
    outcomes: ["Recognise workshop hazards and select appropriate PPE.", "Identify welding equipment, consumables and process characteristics.", "Explain the principles of common arc, MIG and TIG processes.", "Recognise joint types, weld discontinuities and basic inspection methods."],
    modules: [
      makeModule("welding-safety", "Welding Safety & PPE", "Understand hazards, protective equipment, ventilation and safe workshop practices.", "Welding produces intense light, heat, fumes, sparks and electrical hazards. Before work begins, inspect the area, remove combustible materials where possible, confirm that screens and ventilation are suitable, and follow the workshop's hot-work procedure. Only trained and authorised people should operate welding equipment.\n\nWear the specified welding helmet with the correct filter shade, safety footwear, suitable gloves and flame-resistant clothing. Protect nearby people from arc radiation and never weld containers or materials with unknown contents. Know the location of fire extinguishers and emergency isolation controls.", ["Arc radiation can injure eyes and skin; use a suitable helmet, screens and protective clothing.", "Welding fumes require effective local extraction or ventilation.", "Inspect leads, connections, insulation and earthing before energising equipment.", "Keep flammable materials away and follow the authorised hot-work process.", "Never weld a sealed or unidentified container without an approved safe procedure."]),
      makeModule("welding-tools", "Welding Tools & Equipment", "Identify power sources, cables, holders, torches, consumables and setup checks.", "A welding setup includes a power source, work return connection, electrode holder or torch, cables and process-specific consumables. The correct configuration depends on the process, material, joint and welding position. Check the equipment manual and workshop procedure rather than guessing at settings.\n\nInspect the machine casing, cable insulation, connectors, gas hoses and regulators. Secure gas cylinders upright, protect valves and use the correct regulator. Keep consumables dry and stored according to their specifications.", ["Match the power source and accessories to the selected welding process.", "Inspect cables, connectors, torch parts and hoses for visible damage before use.", "Use the correct electrode, wire or filler material for the procedure and base metal.", "Secure gas cylinders upright and protect valves during handling and storage.", "Set current, voltage, polarity and gas flow only from the approved procedure or machine guidance."]),
      makeModule("smaw-arc", "SMAW / Arc Welding", "Learn the shielded metal arc welding principle, electrode selection and basic bead control.", "Shielded Metal Arc Welding (SMAW), often called stick welding, creates an arc between a flux-coated consumable electrode and the workpiece. The arc melts the electrode and base metal to form a weld pool. The electrode coating produces shielding gases and slag that protect the molten metal as it cools.\n\nChoose an electrode suitable for the material and welding position. Maintain a controlled arc length, travel speed and electrode angle. Remove slag between passes using the correct tools and inspect the bead for profile and visible discontinuities.", ["SMAW uses a consumable flux-coated electrode to create the weld metal and shielding.", "Electrode type and diameter must suit the material, thickness, position and procedure.", "A stable arc length helps maintain consistent heat input and bead shape.", "Travel speed and electrode angle influence bead width, penetration and profile.", "Remove slag between passes and inspect the weld before continuing."]),
      makeModule("mig-welding", "MIG Welding", "Understand gas metal arc welding equipment, wire feed, shielding gas and process control.", "MIG welding is commonly used to describe gas metal arc welding with a solid wire electrode and external shielding gas. The wire feeds continuously through a welding gun, while the power source maintains the arc. Wire-feed speed, voltage, travel speed, contact-tip distance and shielding gas all influence the weld.\n\nCheck the wire type, polarity, gas selection and equipment setup against the qualified procedure. Keep the nozzle clean, maintain a consistent gun angle and verify that the gas coverage is not disrupted by draughts or leaks.", ["MIG/GMAW uses a continuously fed wire electrode and an external shielding gas.", "Wire-feed speed and voltage must be balanced for the selected material and thickness.", "Correct polarity and shielding gas are specified by the wire and procedure.", "A consistent gun angle, travel speed and contact-tip distance improve repeatability.", "Check gas flow, leaks, nozzle condition and ventilation before welding."]),
      makeModule("tig-welding", "TIG Welding", "Explore GTAW equipment, non-consumable tungsten electrodes, filler control and clean technique.", "TIG welding, also called gas tungsten arc welding (GTAW), uses a non-consumable tungsten electrode to create the arc. Shielding gas protects the weld area, and filler metal may be added separately when required. The process offers precise control but requires careful coordination and clean materials.\n\nUse the tungsten type, preparation, current and polarity appropriate to the material and procedure. Keep the filler material clean, maintain shielding coverage and avoid touching the tungsten to the weld pool. Allow equipment to cool and follow safe handling procedures after use.", ["TIG/GTAW uses a non-consumable tungsten electrode and shielding gas.", "Filler metal is added separately when the joint design and procedure require it.", "Clean base metal and filler reduce contamination risk.", "Tungsten preparation, current and polarity must match the material and procedure.", "Maintain shielding coverage and avoid contaminating the tungsten electrode."]),
      makeModule("joints-inspection", "Weld Joints & Inspection", "Recognise joint designs, welding positions, discontinuities and basic inspection steps.", "A weld joins components through a defined joint design. Common joint types include butt, lap, T, corner and edge joints. The welding position and access affect preparation, technique and the qualified procedure. A drawing or weld symbol communicates important dimensions and requirements.\n\nVisual inspection checks the weld profile, size, continuity and visible surface condition. Common discontinuities include porosity, undercut, overlap, cracks and incomplete fusion. Record findings using the workshop's inspection criteria and refer uncertain or critical indications to a qualified inspector.", ["Common joint types include butt, lap, T, corner and edge joints.", "Welding position affects access, bead control and the required procedure.", "Weld symbols and drawings communicate joint preparation and weld requirements.", "Visual inspection checks size, profile, continuity and visible surface condition.", "Porosity, undercut, cracks and incomplete fusion are examples of weld discontinuities."]),
    ],
  },
  {
    id: "cnc-toolmaking",
    name: "CNC and Toolmaking",
    category: "Manufacturing & Engineering",
    description: "Learn CNC machine fundamentals, technical drawings, turning, milling, programming and quality checks.",
    level: "Beginner to Advanced",
    accent: "teal",
    type: "vocational",
    duration: "6 learning modules",
    outcomes: ["Identify CNC machine axes, components, workholding and safe setup steps.", "Interpret basic engineering drawings and measurement requirements.", "Explain turning, milling and common cutting-tool applications.", "Read introductory G-code/M-code and perform basic quality checks."],
    modules: [
      makeModule("cnc-fundamentals", "CNC Fundamentals & Setup", "Understand CNC machine structure, coordinate axes, machine controls and setup planning.", "Computer Numerical Control (CNC) machines use programmed instructions to control machine movements and manufacturing operations. A typical machine includes a control unit, axes, spindle, worktable, guarding, coolant system and tool magazine or tool post. The exact layout depends on the machine type.\n\nBefore setup, review the job sheet, drawing, approved program and risk controls. Confirm the workholding, tool condition, machine zero and work offset according to the setup sheet. Keep guards closed during operation and use the approved prove-out process before running a full production cycle.", ["CNC means machine movement and operations are controlled by a programmed sequence.", "Machine axes define the direction and range of controlled movement.", "Workholding must secure the component and provide suitable tool clearance.", "Machine zero and work offsets are different references used by the control.", "Verify the program and setup using the approved simulation or prove-out procedure."]),
      makeModule("engineering-drawings", "Engineering Drawings & Measurement", "Read dimensions, views, tolerances and use measuring instruments correctly.", "Engineering drawings communicate the geometry and requirements of a component. Orthographic views show different faces, while sections reveal internal features. Dimensions, symbols, notes and tolerances specify what must be manufactured and inspected. Always use the current approved drawing revision.\n\nMeasurement tools include steel rules, vernier calipers, micrometers, height gauges and dial indicators. Select an instrument that provides suitable range and resolution, check its condition and zero, and measure using the method appropriate to the feature. Record results with units and compare them with the stated tolerance.", ["Orthographic views show the component from different directions.", "A tolerance defines the permitted variation from a nominal dimension.", "Use the current drawing revision and check units before interpreting dimensions.", "Choose a measuring instrument with suitable range and resolution for the feature.", "Check instrument zero and condition, measure consistently and record units."]),
      makeModule("cnc-lathe", "CNC Lathe Operations", "Explore turning principles, workholding, tools, facing, turning and boring operations.", "A CNC lathe rotates the workpiece while a cutting tool moves along controlled axes to remove material. Typical operations include facing, straight turning, taper turning, grooving, threading and boring. Workholding is commonly provided by a chuck, collet or approved fixture.\n\nSelect a tool suited to the material and operation, verify tool offsets and confirm clearance before running the program. Cutting speed, feed and depth of cut influence surface finish, tool life and productivity. Use the machine manufacturer's guidance and the approved process sheet for actual values.", ["On a lathe, the workpiece rotates while the cutting tool follows programmed movement.", "Facing, turning, grooving, threading and boring are common lathe operations.", "Secure workholding and tool clearance are essential before the spindle starts.", "Tool geometry and offsets must be checked against the setup sheet.", "Cutting speed, feed and depth of cut influence finish, tool life and cycle time."]),
      makeModule("cnc-milling", "CNC Milling Operations", "Understand milling machines, cutter selection, workholding and common machining strategies.", "CNC milling removes material using a rotating multi-edge cutting tool. The machine moves the workpiece or tool along programmed axes to create faces, slots, pockets, profiles and holes. Cutter choice depends on the material, feature geometry, tool reach and required finish.\n\nSecure the component in a vice or fixture, check the tool and holder, verify offsets and confirm that the programmed path clears clamps and fixtures. Follow the approved setup sheet for spindle speed, feed, coolant and cutting strategy.", ["Milling uses a rotating multi-edge cutter to remove material from a workpiece.", "Face mills, end mills, drills and slot cutters serve different machining purposes.", "Workholding must resist cutting forces without distorting the component.", "Tool length and work offsets must match the actual setup.", "Check toolpath clearance around clamps, fixtures and the machine enclosure."]),
      makeModule("g-code", "G-code & M-code Programming", "Read common CNC program blocks, coordinates, motion commands and auxiliary functions.", "CNC programs are organised into blocks containing words such as sequence numbers, preparatory functions, coordinates, feed, speed and tool calls. G-codes commonly describe motion or modal machining functions, while M-codes control auxiliary machine functions. The exact code set varies by controller.\n\nRead a program in sequence and confirm the active work coordinate system, units, tool, offsets and safety moves. Never assume that a code behaves identically on every control. Use the machine manual, post-processor documentation and approved program verification process.", ["A CNC program is a sequence of blocks interpreted by a specific controller.", "G-codes commonly define motion or modal machining functions.", "M-codes commonly control auxiliary functions such as spindle or coolant actions.", "Coordinate words define positions and must use the correct units and work offset.", "Verify controller-specific code meanings and simulate or prove out programs safely."]),
      makeModule("tooling-quality", "Tooling & Quality Checks", "Select cutting tools, monitor wear, inspect finished parts and record quality results.", "Cutting tools are selected according to the workpiece material, operation, machine capability and required finish. Tool material, coating, geometry and rigidity influence performance. Worn or damaged tools can cause poor surface finish, dimensional error, vibration or tool failure.\n\nInspect tools before use and monitor wear indicators during production. After machining, remove burrs safely and inspect critical features using the instruments and sampling plan specified by the drawing or quality procedure. Record results and report non-conforming parts rather than passing them forward.", ["Tool material, coating and geometry should suit the workpiece and operation.", "Tool wear can cause dimensional changes, poor finish, vibration and breakage.", "Check tool condition and replace it according to the approved wear criteria.", "Deburr parts safely before carrying out final measurements.", "Compare measured results with drawing tolerances and record non-conformances."]),
    ],
  },
  {
    id: "esthetics",
    name: "Esthetics",
    category: "Beauty & Personal Care",
    description: "Study skin fundamentals, consultation, facial services, hair removal, makeup and hygiene.",
    level: "Beginner to Advanced",
    accent: "gold",
    type: "vocational",
    duration: "6 learning modules",
    outcomes: ["Describe basic skin structure, functions and common skin types.", "Conduct a professional consultation and recognise when not to proceed.", "Explain the sequence and hygiene controls for basic facial services.", "Apply safe principles to hair removal, makeup and client care."],
    modules: [
      makeModule("skin-anatomy", "Skin Anatomy & Types", "Understand skin layers, functions, common skin types and basic care principles.", "Skin is the body's protective outer covering. Its main layers are the epidermis, dermis and subcutaneous tissue. Skin helps protect against the environment, supports temperature regulation and provides sensory information. Skin appearance and needs vary between individuals and can change with age, environment and lifestyle.\n\nEsthetics professionals should recognise broad skin characteristics such as dry, oily, combination and balanced skin. These descriptions support product selection but are not medical diagnoses. Work within training and refer persistent, painful or unusual skin concerns to a qualified healthcare professional.", ["The epidermis is the outer skin layer and provides an important protective barrier.", "The dermis contains structures such as blood vessels, nerves and connective tissue.", "The subcutaneous layer contains connective tissue and fat beneath the dermis.", "Common descriptive skin types include dry, oily, combination and balanced.", "A skin-care professional must not diagnose medical conditions outside their scope."]),
      makeModule("skin-analysis", "Skin Analysis & Consultation", "Practise client questioning, observation, service suitability and accurate record keeping.", "A skin consultation gathers relevant information before a treatment. Ask about the client's goals, routine, product use, sensitivities, allergies and relevant recent services. Explain the treatment steps, expected sensations, possible reactions, price and after-care. Obtain consent according to salon policy.\n\nObserve the skin under suitable lighting and note visible features without making a medical diagnosis. If the client reports a contraindication or the skin shows signs that make treatment unsuitable, pause and follow the salon's referral or postponement procedure.", ["Ask about goals, allergies, sensitivities, current products and recent treatments.", "Explain the service, possible reactions, cost and after-care before obtaining consent.", "Observe and record relevant visible features without diagnosing a medical condition.", "Check contraindications and follow the salon's policy when treatment may be unsuitable.", "Keep client consultation records relevant, secure and confidential."]),
      makeModule("facial-treatments", "Facial Treatments", "Learn the usual stages of a basic facial and the purpose of cleansing, exfoliation and masks.", "A basic facial is planned around the client's consultation and skin tolerance. A common sequence includes preparation, cleansing, skin observation, optional exfoliation, suitable mask, moisturising and sun-protection advice. Not every step is appropriate for every client or every service.\n\nUse clean hands, fresh linens and sanitised equipment. Follow the product directions, avoid the eye area where directed and monitor comfort throughout. Do not perform aggressive techniques or use products outside your training and the service protocol.", ["A facial sequence is selected according to consultation findings and service protocol.", "Cleansing removes surface impurities and prepares the skin for later steps.", "Exfoliation must be appropriate for the client's skin tolerance and product directions.", "Masks and moisturisers are selected for the service goal and individual skin needs.", "Monitor client comfort and follow hygiene and after-care procedures throughout."]),
      makeModule("hair-removal", "Hair Removal", "Understand common hair-removal methods, preparation, hygiene and client precautions.", "Hair-removal methods include shaving, threading, waxing and other services offered within an esthetician's training. Each method has different preparation, equipment and after-care requirements. The choice depends on the treatment area, hair characteristics, client preference and suitability.\n\nInspect the treatment area and ask about relevant sensitivities, medications or recent skin procedures according to the service protocol. Use clean or single-use applicators as required, maintain correct product temperature and avoid treating unsuitable skin. Provide clear after-care guidance and explain signs that require professional advice.", ["Select a hair-removal method based on the area, client preference and service suitability.", "Check the skin and consultation information before beginning a hair-removal service.", "Use clean tools and never double-dip a single-use applicator into shared product.", "Follow product temperature and application directions to reduce injury risk.", "Give after-care instructions and advise the client to seek help for unusual reactions."]),
      makeModule("makeup-fundamentals", "Makeup Fundamentals", "Learn skin preparation, product selection, colour matching, application and tool hygiene.", "Makeup application begins with clean hands, sanitised tools and suitable skin preparation. Select products according to the client's skin characteristics, desired finish, occasion and preferences. Foundation should be matched in appropriate lighting and blended across the face and jawline for a natural transition.\n\nApply products in a controlled order, using clean applicators and avoiding contamination of shared products. Ask about sensitivities and discontinue use if irritation occurs. Remove makeup gently and provide advice on cleaning brushes and replacing products responsibly.", ["Prepare the skin with products suitable for the client's needs and the planned finish.", "Match foundation in suitable lighting and check the transition at the jawline.", "Use clean brushes, disposable applicators and hygienic product handling.", "Avoid sharing products in ways that can transfer contamination between clients.", "Remove makeup gently and explain basic tool-cleaning and product-care practices."]),
      makeModule("esthetics-hygiene", "Sanitation & Client Care", "Apply salon sanitation, infection-prevention, draping, communication and professional boundaries.", "A safe treatment room is prepared before each client. Clean and disinfect surfaces and reusable equipment using the appropriate product and contact time. Wash or sanitise hands at the required moments, use fresh linens and dispose of waste correctly. Keep clean supplies separate from used items.\n\nProfessional client care includes privacy, clear communication, informed consent and respect for personal boundaries. Explain the treatment, check comfort and maintain appropriate draping. Report incidents and follow the salon's procedure rather than concealing a problem.", ["Clean visible soil before disinfecting reusable surfaces and equipment.", "Follow the disinfectant label, including dilution and required contact time.", "Perform hand hygiene before and after client contact and when required by procedure.", "Use fresh linens and separate clean supplies from used tools and waste.", "Protect privacy, obtain consent and maintain professional boundaries during services."]),
    ],
  },
  {
    id: "it-courses",
    name: "IT Courses",
    category: "Information Technology",
    description: "Choose a technology learning path in programming, frontend development, web design or databases.",
    level: "Beginner to Advanced",
    accent: "teal",
    type: "technology",
    duration: `${technologies.length} technology paths`,
    outcomes: ["Select a technology path that matches your learning goal.", "Study structured topics with lesson text and practical examples.", "Complete a topic quiz after each topic and track your progress.", "Attempt the final assignment after all topics are completed."],
    courses: technologies,
  },
  {
    id: "pos-training",
    name: "POS Training",
    category: "Retail & Business Operations",
    description: "Learn point-of-sale operations, product setup, billing, payments, returns and store reporting.",
    level: "Beginner to Intermediate",
    accent: "gold",
    type: "vocational",
    duration: "6 learning modules",
    outcomes: ["Navigate common POS screens and understand user roles.", "Maintain product and inventory records accurately.", "Process customer billing, payments, discounts and taxes.", "Handle returns and review daily sales and cash reports."],
    modules: [
      makeModule("pos-fundamentals", "POS System Fundamentals", "Understand POS components, user roles, transaction flow and daily opening checks.", "A point-of-sale (POS) system records sales and supports retail operations. Depending on the store, it may include a terminal, barcode scanner, receipt printer, cash drawer, payment device and inventory software. A transaction usually moves from item entry to totals, payment, receipt and stock update.\n\nUsers should sign in with their own authorised account and follow role permissions. At the beginning of a shift, check the terminal, network connection, receipt printer, cash float and payment device according to the store's opening checklist.", ["A POS system records sales and may connect billing, payments and inventory.", "Common POS equipment includes a terminal, scanner, receipt printer and payment device.", "A typical transaction includes item entry, total calculation, payment and receipt.", "Use individual authorised logins and follow role-based permissions.", "Complete the opening checklist before serving customers."]),
      makeModule("product-inventory", "Product & Inventory Setup", "Learn product records, SKU and barcode use, stock receiving and inventory updates.", "Product setup creates the records used during checkout and reporting. A product record may contain a name, SKU, barcode, category, price, tax setting and stock quantity. Accurate records help prevent scanning errors and incorrect totals.\n\nWhen stock arrives, compare it with the purchase or delivery document, inspect for differences and update the system using the approved receiving process. Adjustments should include a reason and an authorised user so the inventory history remains traceable.", ["A product record commonly includes a name, SKU, barcode, category and price.", "A barcode helps the POS identify the correct product during checkout.", "Check received quantities against the delivery document before updating stock.", "Record stock adjustments with a clear reason and authorised user.", "Accurate product and tax settings support correct checkout and reporting."]),
      makeModule("billing-checkout", "Billing & Checkout", "Practise scanning items, building a cart, checking totals and issuing receipts.", "Checkout begins by identifying each product accurately. Scan the barcode or search the approved product record, confirm the item and quantity, and review the cart before payment. The POS calculates the subtotal and applicable taxes or discounts based on configured rules.\n\nBefore finalising, confirm the total with the customer and select the correct payment method. Issue the receipt and verify that the transaction status is complete. If a scanner or network issue occurs, follow the store's fallback procedure instead of recording an unapproved manual sale.", ["Scan or select the correct product record and verify its description.", "Check quantities and the cart before collecting payment.", "Review discounts, taxes and totals according to configured store rules.", "Choose the payment method that matches the customer's transaction.", "Confirm the transaction is complete and issue the receipt."]),
      makeModule("payments-taxes", "Payments, Discounts & Taxes", "Understand payment types, split payments, discounts, tax configuration and transaction checks.", "A POS may support cash, card, contactless, wallet or other approved payment types. The cashier should select the method actually used and wait for the system's confirmation before closing the sale. Split payments must be entered carefully so the combined amount equals the transaction total.\n\nDiscounts and taxes should follow the store's approved configuration and applicable rules. Do not invent a discount or change tax settings without authorisation. Review the receipt and payment status, and escalate duplicate, declined or uncertain transactions using the official process.", ["Select the actual approved payment method and wait for confirmation.", "For split payments, ensure the combined tender matches the total due.", "Apply only authorised discounts and promotions.", "Use the configured tax settings and never alter them without permission.", "Follow the approved process for declined, duplicate or uncertain payments."]),
      makeModule("returns-refunds", "Returns & Refunds", "Learn return eligibility checks, exchanges, refund methods and transaction documentation.", "Returns and refunds should follow the store's written policy. Check the original transaction, proof of purchase, return period, product condition and any category-specific restrictions. Confirm whether the request is a return, exchange, repair or refund before selecting the POS action.\n\nUse the original payment method where policy requires it and obtain approval for exceptions. Record the reason and returned quantity accurately so stock and financial reports remain correct. Provide the customer with the appropriate confirmation and explain any next step.", ["Check the original receipt or transaction and the store's return policy.", "Inspect the item and confirm eligibility before processing the return.", "Choose the correct return, exchange or refund action in the POS.", "Use the refund method required by store policy and obtain approval for exceptions.", "Record the reason and confirm that inventory and transaction records are updated."]),
      makeModule("pos-reports", "Daily Reports & Cash Reconciliation", "Review sales summaries, payment totals, cash handling and end-of-day reconciliation.", "End-of-day procedures compare POS records with actual payment and cash totals. A daily sales report may show gross sales, discounts, taxes, refunds, payment types and transaction counts. Cash reconciliation compares the expected drawer balance with the physical count after accounting for the opening float and recorded movements.\n\nCount cash according to the store's dual-control or verification policy, investigate differences and document the outcome. Close or batch payment terminals when required and ensure reports are stored or submitted through the approved process.", ["Daily sales reports summarise sales, discounts, taxes, refunds and payment types.", "Expected cash is calculated from the opening float and recorded cash movements.", "Count physical cash using the store's verification procedure.", "Investigate and document differences instead of changing totals to force a match.", "Complete terminal settlement and report submission according to store policy."]),
    ],
  },
];

export const getCourseCategory = (courseId) => courseCategories.find((course) => course.id === courseId);

// Keep course workspaces on the existing My Learning route. Query parameters
// preserve the selected course and optional IT technology path across refreshes.
export const myLearningCoursePath = (courseId, technologyId) => {
  const query = [];
  if (courseId) query.push(`course=${encodeURIComponent(courseId)}`);
  if (technologyId) query.push(`technology=${encodeURIComponent(technologyId)}`);
  return query.length ? `/student/my-learning?${query.join("&")}` : "/student/my-learning";
};

export const sampleResources = [
  { id: "r1", title: "React Fundamentals – Study Notes", technology: "React", type: "PDF", description: "A lesson-wise revision document." },
  { id: "r2", title: "JavaScript Quick Reference", technology: "JavaScript", type: "PDF", description: "Syntax and common language patterns." },
  { id: "r3", title: "Python Fundamentals – Presentation", technology: "Python", type: "PPT", description: "A slide deck for classroom review." },
  { id: "r4", title: "SQL Practice Worksheet", technology: "SQL", type: "PDF", description: "Practice prompts for common SQL concepts." },
  { id: "r5", title: "Java OOP – Presentation", technology: "Java", type: "PPT", description: "Classes, inheritance and polymorphism slides." },
  { id: "r6", title: "HTML & CSS Cheat Sheet", technology: "HTML & CSS", type: "PDF", description: "Common tags, selectors and layout snippets." },
];

export const learningFlow = [
  "Select a course category",
  "Choose a course or module",
  "Study theory & examples",
  "Review resources",
  "Attempt the quiz",
  "Practice with AI",
  "Track your progress",
];
