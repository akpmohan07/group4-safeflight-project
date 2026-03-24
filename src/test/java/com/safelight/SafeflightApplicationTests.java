package com.safelight;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Context test requires running Postgres; disabled to keep build simple")
class SafeflightApplicationTests {

	@Test
	void contextLoads() {
	}

}
