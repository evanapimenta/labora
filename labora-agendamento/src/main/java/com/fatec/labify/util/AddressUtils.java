package com.fatec.labify.util;

import com.fatec.labify.api.dto.GeolocationDTO;
import com.fatec.labify.api.dto.patient.AddressDTO;
import com.fatec.labify.domain.Address;

import java.util.Optional;

public class AddressUtils {

    public static Address setAddress(AddressDTO dto, GeolocationDTO geolocationDTO) {
        Address address = new Address(
                dto.getStreet(),
                dto.getNumber(),
                dto.getNeighborhood(),
                dto.getCity(),
                dto.getState(),
                dto.getZipCode(),
                dto.getCountry(),
                geolocationDTO.getLatitude(),
                geolocationDTO.getLongitude());

        return address;
    }

    public static Address updateAddress(Address address, AddressDTO dto) {
        Optional.ofNullable(dto.getStreet()).ifPresent(address::setStreet);
        Optional.ofNullable(dto.getNumber()).ifPresent(address::setNumber);
        Optional.ofNullable(dto.getComplement()).ifPresent(address::setComplement);
        Optional.ofNullable(dto.getNeighborhood()).ifPresent(address::setNeighborhood);
        Optional.ofNullable(dto.getCity()).ifPresent(address::setCity);
        Optional.ofNullable(dto.getState()).ifPresent(address::setState);
        Optional.ofNullable(dto.getCountry()).ifPresent(address::setCountry);
        Optional.ofNullable(dto.getZipCode()).ifPresent(address::setZipCode);

        return address;
    }

    public static AddressDTO fromRow(Object[] row, int startIndex) {
        AddressDTO address = new AddressDTO();
        address.setStreet((String) row[startIndex]);
        address.setNumber((String) row[startIndex + 1]);
        address.setComplement((String) row[startIndex + 2]);
        address.setNeighborhood((String) row[startIndex + 3]);
        address.setCity((String) row[startIndex + 4]);
        address.setState((String) row[startIndex + 5]);
        address.setZipCode((String) row[startIndex + 6]);
        address.setCountry((String) row[startIndex + 7]);
        return address;
    }

}
