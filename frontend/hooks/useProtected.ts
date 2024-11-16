import apiUrl from "@/constants/apiUrl";
import axios from "axios";

const useProtected = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return false;
    }

    try {
        const response = await axios.get(apiUrl + '/users/protected', {
            headers: {
                'x-access-token': token
            }
        });

        if (response.status === 200) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};

export default useProtected;