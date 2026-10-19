# ContractPulse AI: Project Workflow

Is guide mein bataya gaya hai ki ContractPulse AI ko user kaise use karega, portfolio dekhne se lekar project par decision lene tak.

> **Abhi ka version:** Yeh frontend demo hai aur ismein sample data use hota hai. Yeh Spring Boot, database, ya real AI model se connected nahi hai. Neeche “current demo” mein aaj ke working interactions hain. “Future system” mein bataya gaya hai ki backend banne ke baad workflow kaise kaam kar sakta hai.

## Workflow ek nazar mein

```text
Portfolio overview kholo
        ↓
Follow-up ki zaroorat wala project dhoondo
        ↓
Project risk brief kholo
        ↓
Milestone, risk ke reasons aur evidence dekho
        ↓
Suggested action approve ya dismiss karo
        ↓
Future system: decision save hoga aur project history mein dikhega
```

## Step 1: Portfolio overview kholo

User sabse pehle Overview page dekhta hai. Ismein sample portfolio ki high-level information dikhti hai:

- Kitne contracts active hain.
- Kitne contracts par dhyaan dena zaroori hai.
- Total committed budget.
- Is mahine aane wale milestones.
- Planned progress aur sample forecast ki tulna karta schedule chart.

Is step ka maksad program manager ko yeh samajhne mein madad dena hai ki pehle kis project ko dekha jaaye. Demo mein ye saari values frontend mein likha hua sample data hain.
Budget Indian rupees (INR) mein crore units ke saath dikhaya gaya hai. Yeh sample values hain; kisi exchange rate se conversion nahi kiya gaya hai.

## Step 2: Follow-up wala project dhoondo

User concern do jagah dekh sakta hai:

- **Priority signals:** possible project issues ki chhoti descriptions.
- **Project performance table:** har project ka progress, delay risk, cost risk aur status.

Demo mein kuch example signals:

- East River Flood Barrier mein permit review ki wajah se foundation work ruk sakta hai.
- I-405 Sound Wall Expansion mein material cost estimate se zyada ho sakti hai.
- South County Water Main mein completed work ke mukable spending aage chal rahi hai.

Signals ke paas dikhne wale percentages sirf demo risk scores hain. Yeh kisi live prediction service se nahi aate.

Projects page ke **Add project** button se sample project browser state mein joda ja sakta hai. Form mein actual/planned progress, project finish dates aur ek milestone bharna hota hai. Yeh record reload ke baad nahi rehta aur backend ko request nahi bhejta.
Project details mein **Record update** se date-wise planned/actual progress snapshot add kiya ja sakta hai, jiska graph usi drawer mein dikhta hai. **Add milestone** naya milestone jodta hai; milestone status badal kar Complete karne se us din ki actual finish date record hoti hai. Ye changes bhi sirf current browser session mein rehte hain.

## Step 3: Project brief kholo

User signal ya project row select karta hai. Screen ke right side se project details ka panel khulta hai.

Brief mein selected project ke liye yeh cheezein dikhti hain:

- Project ka naam, agency aur status.
- Delay aur cost risk values.
- Progress variance (actual minus planned, percentage points).
- Schedule variance (forecast project finish minus baseline finish, days).
- Milestones ki planned date, status aur delay (complete hone par actual date, warna forecast date se).
- Concern ke possible reasons.
- Field report ka example text.
- Agla step lene ke liye ek suggestion.

Positive variance ka matlab schedule se peeche hai. Dates ya comparison value na ho toh feature result unavailable rahega, zero assume nahi hota. Close button ya panel ke bahar wale shaded area par click karke panel band kiya ja sakta hai. Demo mein project details local sample data se aati hain. Kuch reasons aur report text fixed example hain. Feature values formula-based demo calculations hain, ML prediction nahi.

## Step 4: Reasons aur evidence dekho

Decision lene se pehle user signal ke peeche ki information dekhta hai. Jaise East River brief mein permit review ka delay, subcontractor capacity aur weather ka asar diya gaya hai. Saath hi environmental clearance ke baare mein field report ka chhota excerpt dikhta hai.

Sirf score dikhana kaafi nahi hota. Project team ko yeh bhi samajhna chahiye ki warning kis baat par based hai aur kya check karna hai. Real system mein har reason ko current project data se jodna hoga. Report ko secure document service se khulna chahiye, jahan sirf allowed users use dekh saken. Demo mein report text static hai aur source-document button connected nahi hai.

## Step 5: Kya karna hai, decide karo

User do actions mein se ek choose kar sakta hai:

### Recommendation approve karo

Project brief agency ke saath meeting rakhne ka suggestion deta hai, taaki permit issue solve ho sake. **Approve recommendation** par click karne se button approved state dikhata hai.

### Recommendation dismiss karo

**Dismiss** par click karne se suggestion ki jagah dismissal notice dikhta hai aur audit message update hota hai. Agar user decision badalna chahe, toh **Undo** se suggestion wapas la sakta hai.

Abhi dono actions sirf browser page ko update karte hain. Koi request server ko nahi jaati aur kuch save nahi hota. Page reload ya band karne ke baad state reset ho jaati hai.

## Step 6: Decision save karke follow-up karo (future backend workflow)

Jab Spring Boot backend banega, toh decision step ko real save operation banana chahiye:

1. Frontend project ID, recommendation ID, selected action aur zaroorat padne par reviewer ka note backend ko bhejega.
2. Backend check karega ki user signed in hai aur use is project ko review karne ki permission hai.
3. Backend check karega ki recommendation abhi valid hai aur us par action liya ja sakta hai.
4. Backend decision ko reviewer ki pehchaan aur decision ke time ke saath save karega.
5. Backend project history mein ek event add karega. Is history ko **audit trail** bhi kehte hain.
6. Frontend saved result dikhayega, ya problem hone par user ko batayega.
7. Diya gaya follow-up project team ko dikhaya ja sakta hai aur agli review mein include kiya ja sakta hai.

Yeh ek suggested design hai. Final API, approval ke rules aur required notes backend team aur project stakeholders ke saath decide karne honge.

## Dashboard ke doosre actions

Main workflow ke saath yeh actions bhi available hain:

- **Search:** sample project list ko project name, agency ya contractor se filter karta hai.
- **Filter button:** example search term `East` lagata ya hataata hai.
- **Notifications:** example alerts ki list kholta hai. Yeh live notifications nahi hain.
- **Sidebar navigation:** Projects, Risk Signals, Documents, Contractors, Budget & Spend, aur Help Center ke alag frontend demo views khulta hai. In views ka data abhi sample hai aur backend se connected nahi hai.
- **Mobile menu:** chhoti screen par sidebar kholta ya band karta hai.
- **Timeframe button:** label badalta hai, chart ka data nahi.
- **Add project:** validated form se in-memory sample project banata hai; reload par reset ho jata hai.

## Evaluation ke liye chhota demo workflow

1. **Portfolio overview** se shuru karke summary numbers samjhao.
2. East River permit review wali weekly note dikhao.
3. Chart samjhao: October ke liye 80% planned hai aur sample forecast 72% hai.
4. East River priority signal select karo.
5. Milestone, example risk reasons aur report excerpt dikhao.
6. **Approve recommendation** ya **Dismiss** click karke updated screen dikhao.
7. Saaf batao ki decision abhi save nahi hota; Spring Boot backend banne ke baad save hoga.

Demo shuru karne ke liye yeh keh sakte ho:

> “Is workflow mein project manager pehle portfolio warning dekhta hai, phir uska reason aur supporting report check karta hai, aur uske baad khud decision leta hai. Yeh version sample data ke saath screens aur interactions dikhata hai. Backend aane ke baad real information milegi aur decisions save honge.”

## Kaun kya karega?

| Workflow ka hissa | Abhi ke demo mein | Future system mein |
| --- | --- | --- |
| Portfolio aur projects dikhana | Local sample data use hota hai | Spring Boot service se data load hoga |
| Possible issue dhoondhna | Sample signals aur scores dikhte hain | Tested data aur agreed risk rules ya model results use honge |
| Issue ka reason samjhana | Example factors dikhte hain | Real project data se judi explanation milegi |
| Source report dekhna | Fixed example text dikhta hai | Permission check ke saath real documents milenge |
| Approve ya dismiss karna | Browser state badalti hai | Backend decision check karke save karega |
| Decision history rakhna | Sirf audit-style message dikhta hai | Kisne, kya aur kab decide kiya, woh save hoga |
| Team ko notify karna | Static example alerts dikhte hain | Notification service user ke hisaab se updates bhejegi |

## Yaad rakhne wali baatein

- Final decision user leta hai, software nahi.
- Abhi ke numbers aur projects real project data nahi hain.
- Abhi koi real prediction model connected nahi hai.
- Is version mein approval aur dismissal save nahi hote.
- Future backend ko project data secure rakhna hoga aur important decisions ka record rakhna hoga.