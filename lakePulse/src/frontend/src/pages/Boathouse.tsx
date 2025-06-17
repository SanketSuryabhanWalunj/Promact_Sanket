import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { APP_STRINGS } from '../constants/strings';
import { mylakes } from '../types/api.types';
import { getMyLakes, sendBoathouseEmail } from '../services/api/lake.service';

const Boathouse = () => {

  // New: form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState('');

  // New: submit handler for form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await sendBoathouseEmail({
        subject,
        email,
        name,
        message,
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error(APP_STRINGS.ERROR_SENDING_EMAIL, error);
    }
  };

  return (
    <div>
     
      <main>
        <div className='main-page-wrap'>

          <div className='boathouse-wrap'>
            <h1>
              {APP_STRINGS.BOATHOUSE_TITLE}
            </h1>

            <section>
              <h2>
                {APP_STRINGS.BOATHOUSE_DESC}
              </h2>
              <p>We are here to support subscribers reach your lake health & safeety goals. To accomplish this we are organized around 5 centers of excellence:</p>
              <h2>Uploading Historic Data</h2>
              <p>You are looking to get testing and monitoring data from old PDFs and spreadsheets.</p>
              <h2>Toolbox Questions</h2>
              <p>Not sure what to buy? Ask us, we will guide you towards the solutions that meet your financial, perational, and strategic needs</p>
              <h2>Data Questions</h2>
              <p>Not sure what the data means? Just ask us and we will provide an explanation in plain English.</p>
              <h2>Access to Government, Non_Profits, or Consultants</h2>
              <p>You are looking to connect with a 3rd party, we can help make introductions.</p>
              <h2>General Lake Health & Safety Questions</h2>
              <p>You have a question about algai blooms, invasive species, or any number of impairments. We will do our best to get you the information you need to take action.</p>
            </section>

            <section>
              <div className='boathouse-form-wrap'>
                <form className="boathouse-form" onSubmit={handleSubmit}>
                {submitted && 
                    <p className="boathouse-success">{APP_STRINGS.THANKYOU_BOATHOUSE}</p>
                  }
                  <label htmlFor="name">{APP_STRINGS.NAME}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="boathouse-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <label htmlFor="email">{APP_STRINGS.EMAIL_ADDRESS}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="boathouse-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="subject">{APP_STRINGS.SUBJECT}</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="boathouse-input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />

                  <label htmlFor="message">{APP_STRINGS.MESSAGE}</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="boathouse-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />

                  <button type="submit" className="theme-button">{APP_STRINGS.SEND}</button>            
                </form>
              </div>
            </section>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Boathouse;
