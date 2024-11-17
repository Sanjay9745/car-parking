import apiUrl from "@/constants/apiUrl";
import axios from "axios";

const useAdminProtected = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        return false;
    }

    try {
        const response = await axios.get(apiUrl + '/admin/protected', {
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

export default useAdminProtected;