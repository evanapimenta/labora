package com.fatec.labify.domain;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
@Embeddable
@AttributeOverrides({
        @AttributeOverride(name = "street", column = @Column(name = "address_street")),
        @AttributeOverride(name = "number", column = @Column(name = "address_number")),
        @AttributeOverride(name = "complement", column = @Column(name = "address_complement")),
        @AttributeOverride(name = "neighborhood", column = @Column(name = "address_neighborhood")),
        @AttributeOverride(name = "city", column = @Column(name = "address_city")),
        @AttributeOverride(name = "state", column = @Column(name = "address_state")),
        @AttributeOverride(name = "zipCode", column = @Column(name = "address_postal_code")),
        @AttributeOverride(name = "country", column = @Column(name = "address_country")),
        @AttributeOverride(name = "latitude", column = @Column(name = "address_latitude")),
        @AttributeOverride(name = "longitude", column = @Column(name = "address_longitude"))
})
public class Address {
    private String street;

    private String number;

    private String complement;

    private String neighborhood;

    private String city;

    private String state;

    private String zipCode;

    private String country;

    private double latitude;

    private double longitude;

    public Address(String street, String number, String neighborhood, String city, String state, String zipCode, String country, double latitude, double longitude) {
        this.street = street;
        this.number = number;
        this.neighborhood = neighborhood;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
    }

}
