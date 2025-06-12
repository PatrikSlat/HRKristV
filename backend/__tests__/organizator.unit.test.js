const request = require('supertest'); // OVO DVOJE NAM SKORO VUIJEK TREBA
const app = require('../index'); 

it('vraća 401 kad korisničko ime ne postoji', async () => {
    const res = await request(app)
      .post('/api/auth/login/organizator')
      .send({
        username: 'nepoznati_korisnik',
        password: 'bilošta'
      });
    expect(res.status).toBe(401); 
    expect(res.body.message).toMatch(/Neispravno korisničko ime ili lozinka/);
  });
  
  it('vraća 401 kad je lozinka pogrešna za postojećeg korisnika', async () => {
    const res = await request(app)
      .post('/api/auth/login/organizator')
      .send({
        username: 'dobar_korisnik', 
        password: 'KRIVAlozinka123' 
      });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Neispravno korisničko ime ili lozinka/);
  });
  

it('GET /api/random/test vraća objekt s podatcima', async () => {
    const res = await request(app)
      .get('/api/random/test');
    expect(res.status).toBe(200); 
    expect(typeof res.body).toBe('object'); 
    expect(Object.keys(res.body).length).toBeGreaterThan(0); 
  });
  
  it('Da ruta za crvke vraća objekt', async () => {
    const res = await request(app)
      .get('/api/crkve');
    expect(res.status).toBe(200); 
    expect(Array.isArray(res.body)).toBe(true); 
  });


  describe('Login organizator ruta', () => {
    it('vraća 400 kaa nedostaju podaci', async () => {
      const res = await request(app)
        .post('/api/auth/login/organizator')
        .send({}); 
      expect(res.status).toBe(400); // očekujemo 400 - Bad Request
      expect(res.body.message).toMatch(/obavezni/); 
    });
  });


  