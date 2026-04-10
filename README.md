<div align='center'>

  [![demo][demo]][demo-link]
  [![status][status]][status-link]
  [![test][tests]][tests-link]

</div>

<div align='center'>
  <a href='/'>
    <img
      src='/images/screenshot.png'
      alt='Screenshot of the app'
      width='100%'
    />
  </a>
</div>

<div align='center'>
  <h1>CRUD Task App with Django and React</h1>
</div>

<div align='center'>

  [![Django][django]][django-link]
  [![Django REST Framework][django-rest-framework]][django-rest-framework-link]
  [![Python][python]][python-link]
  [![React][react]][react-link]
  [![Vite][vite]][vite-link]
  [![Tailwind CSS][tailwindcss]][tailwindcss-link]
  [![Axios][axios]][axios-link]
  [![React Hook Form][react-hook-form]][react-hook-form-link]

</div>

<div align='center'>
  A full-stack CRUD task management application built with Django REST Framework on the backend and React with Vite on the frontend. Create, read, update, and delete tasks with a modern, responsive UI styled with Tailwind CSS.

  [Demo]({{DEMO_URL}}) · [Report issue](/issues) · [Suggest something](/issues)
</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running locally](#running-locally)
  - [Build](#build)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Demo](#demo)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Features

- [x] Full CRUD operations for tasks (Create, Read, Update, Delete)
- [x] REST API built with Django REST Framework
- [x] React frontend with Vite for fast development
- [x] Responsive UI styled with Tailwind CSS
- [x] Form handling with React Hook Form
- [x] Client-side routing with React Router DOM
- [x] Toast notifications with React Hot Toast
- [x] API documentation with CoreAPI
- [x] CORS support with django-cors-headers
- [x] Static file serving with WhiteNoise
- [x] Database configuration with dj-database-url
- [x] Production-ready deployment with Gunicorn
- [x] Deployable on Railway with Nixpacks

## Tech Stack

- [Python](https://www.python.org/)
- [Django 4.2](https://www.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React 18](https://react.dev/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [React Hook Form](https://react-hook-form.com/)
- [React Router DOM](https://reactrouter.com/)
- [React Hot Toast](https://react-hot-toast.com/)
- [WhiteNoise](https://whitenoise.readthedocs.io/)
- [Gunicorn](https://gunicorn.org/)

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/wrujel/django-crud-react.git
cd django-crud-react
pip install -r requirements.txt
cd client
npm install
cd ..
```

### Running locally

Start the Django backend:

```bash
python manage.py migrate
python manage.py runserver
```

In a separate terminal, start the React frontend:

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the React frontend.
The Django API will be available at [http://localhost:8000](http://localhost:8000).

### Build

Build the React frontend for production:

```bash
cd client
npm run build
```

Then collect static files and run with Gunicorn:

```bash
python manage.py collectstatic
gunicorn django_crud_api.wsgi
```

## Environment Variables

| Variable           | Description                                                | Required |
| :----------------- | :--------------------------------------------------------- | :------: |
| `DATABASE_URL`     | Database connection string (defaults to SQLite if not set) |    No    |
| `VITE_BACKEND_URL` | Backend URL for the React app in production                |   Yes    |

## Project Structure

```
/
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── tasks.api.js
│   │   ├── components/
│   │   │   ├── Navigation.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   └── TasksList.jsx
│   │   ├── pages/
│   │   │   ├── TasksFormPage.jsx
│   │   │   └── TasksPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── django_crud_api/         # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── tasks/                   # Django tasks app
│   ├── models.py
│   ├── serializer.py
│   ├── urls.py
│   └── views.py
├── images/
│   └── screenshot.png
├── manage.py
├── requirements.txt
├── Procfile
├── nixpacks.toml
└── runtime.txt
```

## Demo

You can check out the demo:

[![Demo][demo]][demo-link]

## API Reference

| Method   | Endpoint                   | Description       | Auth Required |
| :------- | :------------------------- | :---------------- | :-----------: |
| `GET`    | `/tasks/api/v1/tasks/`     | List all tasks    |      No       |
| `POST`   | `/tasks/api/v1/tasks/`     | Create a new task |      No       |
| `GET`    | `/tasks/api/v1/tasks/:id/` | Get task by ID    |      No       |
| `PUT`    | `/tasks/api/v1/tasks/:id/` | Update a task     |      No       |
| `DELETE` | `/tasks/api/v1/tasks/:id/` | Delete a task     |      No       |
| `GET`    | `/tasks/docs/`             | API documentation |      No       |

## Contributing

Contributions are welcome! If you have suggestions or find bugs, please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).

---

<!-- Badges -->
[django]: https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=green
[django-rest-framework]: https://img.shields.io/badge/django%20rest-092E20?style=for-the-badge&logo=django&logoColor=green
[python]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[react]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[tailwindcss]: https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[axios]: https://img.shields.io/badge/Axios-671ddf?style=for-the-badge&logo=axios&logoColor=white
[react-hook-form]: https://img.shields.io/badge/React%20Hook%20Form-20232A?style=for-the-badge&logo=react&logoColor=61DAFB

<!-- Badge links -->
[django-link]: https://www.djangoproject.com/
[django-rest-framework-link]: https://www.django-rest-framework.org/
[python-link]: https://www.python.org/
[react-link]: https://react.dev/
[vite-link]: https://vite.dev/
[tailwindcss-link]: https://tailwindcss.com/
[axios-link]: https://axios-http.com/
[react-hook-form-link]: https://react-hook-form.com/

<!-- Status/Demo badges -->
[demo]: https://img.shields.io/badge/🚀%20Live%20Demo-000000?style=for-the-badge&&logoColor=white&color=0a6bdb
[status-link]: https://github.com/wrujel/monitor-repos
[tests-link]: https://github.com/wrujel/monitor-tests

[demo-link]: {{DEMO_URL}}
[status]: https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwrujel%2Fmonitor-repos%2Fmain%2Fdata%2Fdjango-crud-react.json
[tests]: https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwrujel%2Fmonitor-tests%2Fmain%2Fdata%2Fdjango-crud-react.json
