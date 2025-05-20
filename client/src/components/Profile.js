import React from 'react';

const Profile = () => {
    const username = localStorage.getItem('username');

    return (
        <div className="container mt-3">
            <h2>Profil Bilgileri</h2>
            <p>Kullanıcı Adı: {username}</p>
        </div>
    )
};

export default Profile;